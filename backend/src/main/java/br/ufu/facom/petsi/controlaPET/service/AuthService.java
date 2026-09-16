package br.ufu.facom.petsi.controlaPET.service;

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

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public @Nullable AuthResponseDTO login(LoginRequestDTO request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return new AuthResponseDTO(accessToken, refreshToken);
    }

    public @Nullable AuthResponseDTO refreshToken(RefreshTokenRequestDTO request) {
        String userEmail = jwtService.extractUsername(request.refreshToken());

        if (userEmail != null) {
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

            if (jwtService.isTokenValid(request.refreshToken(), user)) {
                String accessToken = jwtService.generateToken(user);
                String refreshToken = jwtService.generateRefreshToken(user);

                return new AuthResponseDTO(accessToken, refreshToken);
            }
        }

        throw new IllegalArgumentException("Refresh token inválido ou expirado");
    }

    public void requestPasswordReset(ForgotPasswordRequestDTO request, String ipAddress) {
        String email = request.email().trim().toLowerCase();
        if (!passwordResetRateLimiter.tryAcquire(email, ipAddress)) {
            return;
        }

        userRepository.findByEmail(email).filter(User::isActive).ifPresent(user -> {
            String token = generateToken();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .tokenHash(hashToken(token))
                    .user(user)
                    .expiresAt(LocalDateTime.now().plusMinutes(30))
                    .used(false)
                    .build();

            passwordResetTokenRepository.save(resetToken);
            emailService.sendPasswordReset(user.getEmail(), frontendUrl + "/redefinir-senha?token=" + token);
            passwordResetAuditRepository.save(PasswordResetAudit.builder()
                    .user(user)
                    .eventType("REQUESTED")
                    .requestIp(ipAddress)
                    .build());
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequestDTO request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(hashToken(request.token()))
                .orElseThrow(() -> new IllegalArgumentException("Link de redefinição inválido ou expirado."));

        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Link de redefinição inválido ou expirado.");
        }

        User user = resetToken.getUser();
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
