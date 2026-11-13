package br.ufu.facom.petsi.controlaPET.service;

import br.ufu.facom.petsi.controlaPET.exception.BusinessException;

import br.ufu.facom.petsi.controlaPET.dto.userDTO.AuthResponseDTO;
import br.ufu.facom.petsi.controlaPET.dto.userDTO.LoginRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.userDTO.RefreshTokenRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.userDTO.ForgotPasswordRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.userDTO.ResetPasswordRequestDTO;
import br.ufu.facom.petsi.controlaPET.model.PasswordResetToken;
import br.ufu.facom.petsi.controlaPET.model.PasswordResetAudit;
import br.ufu.facom.petsi.controlaPET.model.User;
import br.ufu.facom.petsi.controlaPET.repository.PasswordResetAuditRepository;
import br.ufu.facom.petsi.controlaPET.repository.PasswordResetTokenRepository;
import br.ufu.facom.petsi.controlaPET.repository.UserRepository;
import br.ufu.facom.petsi.controlaPET.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import io.jsonwebtoken.JwtException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordResetAuditRepository passwordResetAuditRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final PasswordResetRateLimiter passwordResetRateLimiter;
    private final LoginRateLimiter loginRateLimiter;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Transactional
    public void logout(User user) {
        userRepository.revokeSessions(user.getId());
        jdbcTemplate.update("DELETE FROM refresh_tokens WHERE user_id = ?", user.getId());
    }

    @Transactional
    public @Nullable AuthResponseDTO login(LoginRequestDTO request) {
        if (!loginRateLimiter.tryAcquire(request.email())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.TOO_MANY_REQUESTS, "Muitas tentativas. Tente novamente mais tarde.");
        }
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException("Usuário não encontrado"));

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        saveRefreshToken(user, refreshToken);

        return new AuthResponseDTO(accessToken, refreshToken);
    }

    @Transactional
    public @Nullable AuthResponseDTO refreshToken(RefreshTokenRequestDTO request) {
        String userEmail;
        try {
            userEmail = jwtService.extractUsername(request.refreshToken());
        } catch (JwtException | IllegalArgumentException ex) {
            throw new BadCredentialsException("Token inválido ou expirado.");
        }

        if (userEmail != null) {
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new BadCredentialsException("Token inválido ou expirado."));

            if (jwtService.isTokenValid(request.refreshToken(), user, "refresh")) {
                int consumed = jdbcTemplate.update("DELETE FROM refresh_tokens WHERE token_hash = ? AND user_id = ? AND expires_at > CURRENT_TIMESTAMP",
                        hashToken(request.refreshToken()), user.getId());
                if (consumed != 1) throw new BadCredentialsException("Token inválido ou expirado.");
                String accessToken = jwtService.generateToken(user);
                String refreshToken = jwtService.generateRefreshToken(user);
                saveRefreshToken(user, refreshToken);

                return new AuthResponseDTO(accessToken, refreshToken);
            }
        }

        throw new BadCredentialsException("Token inválido ou expirado.");
    }

    private void saveRefreshToken(User user, String token) {
        jdbcTemplate.update("DELETE FROM refresh_tokens WHERE expires_at <= CURRENT_TIMESTAMP");
        jdbcTemplate.update("INSERT INTO refresh_tokens(token_hash, user_id, expires_at) VALUES (?, ?, ?)",
                hashToken(token), user.getId(), java.sql.Timestamp.from(jwtService.getExpiration(token).toInstant()));
    }

    @Transactional
    public void requestPasswordReset(ForgotPasswordRequestDTO request, String ipAddress) {
        String email = request.email().trim().toLowerCase();
        if (!passwordResetRateLimiter.tryAcquire(email, ipAddress)) {
            return;
        }

        userRepository.findByEmail(email).filter(User::isActive).ifPresent(user -> {
            sendPasswordResetEmail(user, ipAddress, "REQUESTED", false);
        });
    }

    public void sendInitialPasswordSetup(User user) {
        sendPasswordResetEmail(user, null, "INITIAL_SETUP", true);
    }

    private void sendPasswordResetEmail(User user, String ipAddress, String eventType, boolean initialSetup) {
        passwordResetTokenRepository.invalidateUnusedTokensByUser(user);
        String token = generateToken();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .tokenHash(hashToken(token))
                .user(user)
                .expiresAt(initialSetup ? LocalDateTime.now().plusHours(48) : LocalDateTime.now().plusMinutes(30))
                .used(false)
                .build();

        passwordResetTokenRepository.save(resetToken);
        String resetUrl = frontendUrl + "/redefinir-senha?token=" + token;
        if (initialSetup) {
            emailService.sendInitialPasswordSetup(user.getEmail(), resetUrl);
        } else {
            emailService.sendPasswordReset(user.getEmail(), resetUrl);
        }
        passwordResetAuditRepository.save(PasswordResetAudit.builder()
                .user(user)
                .eventType(eventType)
                .requestIp(ipAddress)
                .build());
    }

    @Transactional
    public void resetPassword(ResetPasswordRequestDTO request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(hashToken(request.token()))
                .orElseThrow(() -> new BusinessException("Link de redefinição inválido ou expirado."));

        LocalDateTime now = LocalDateTime.now();
        if (resetToken.isUsed() || resetToken.getExpiresAt() == null
                || resetToken.getExpiresAt().isBefore(now)
                || resetToken.getExpiresAt().isAfter(now.plusHours(48))) {
            throw new BusinessException("Link de redefinição inválido ou expirado.");
        }

        User user = resetToken.getUser();
        if (!user.isActive()) {
            throw new BusinessException("Link de redefinição inválido ou expirado.");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setPasswordChangedAt(LocalDateTime.now());
        user.setSessionVersion(user.getSessionVersion() == null ? 1L : user.getSessionVersion() + 1);
        resetToken.setUsed(true);
        userRepository.save(user);
        passwordResetTokenRepository.save(resetToken);
        passwordResetAuditRepository.save(PasswordResetAudit.builder()
                .user(user)
                .eventType("COMPLETED")
                .build());
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hash = new StringBuilder();
            for (byte currentByte : digest) {
                hash.append(String.format("%02x", currentByte));
            }
            return hash.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("Algoritmo de hash indisponível.", exception);
        }
    }
}
