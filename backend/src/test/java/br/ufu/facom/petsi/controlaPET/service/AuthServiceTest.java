package br.ufu.facom.petsi.controlaPET.service;

import br.ufu.facom.petsi.controlaPET.dto.userDTO.AuthResponseDTO;
import br.ufu.facom.petsi.controlaPET.dto.userDTO.ForgotPasswordRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.userDTO.LoginRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.userDTO.RefreshTokenRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.userDTO.ResetPasswordRequestDTO;
import br.ufu.facom.petsi.controlaPET.model.PasswordResetAudit;
import br.ufu.facom.petsi.controlaPET.model.PasswordResetToken;
import br.ufu.facom.petsi.controlaPET.model.User;
import br.ufu.facom.petsi.controlaPET.model.enums.UserRole;
import br.ufu.facom.petsi.controlaPET.repository.PasswordResetAuditRepository;
import br.ufu.facom.petsi.controlaPET.repository.PasswordResetTokenRepository;
import br.ufu.facom.petsi.controlaPET.repository.UserRepository;
import br.ufu.facom.petsi.controlaPET.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtService jwtService;
    @Mock private UserRepository userRepository;
    @Mock private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock private PasswordResetAuditRepository passwordResetAuditRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private EmailService emailService;
    @Mock private PasswordResetRateLimiter passwordResetRateLimiter;
    @InjectMocks private AuthService authService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "frontendUrl", "https://app.teste");
    }

    @Test
    void logsInAndReturnsAccessAndRefreshTokens() {
        User user = user("membro@teste.com");
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(user)).thenReturn("refresh-token");

        AuthResponseDTO response = authService.login(new LoginRequestDTO(user.getEmail(), "senha"));

        assertEquals("access-token", response.token());
        assertEquals("refresh-token", response.refreshToken());
        ArgumentCaptor<UsernamePasswordAuthenticationToken> authentication = ArgumentCaptor.forClass(UsernamePasswordAuthenticationToken.class);
        verify(authenticationManager).authenticate(authentication.capture());
        assertEquals(user.getEmail(), authentication.getValue().getPrincipal());
        assertEquals("senha", authentication.getValue().getCredentials());
    }

    @Test
    void refreshesTokensWhenRefreshTokenIsValid() {
        User user = user("membro@teste.com");
        when(jwtService.extractUsername("refresh-token")).thenReturn(user.getEmail());
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(jwtService.isTokenValid("refresh-token", user)).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("new-access-token");
        when(jwtService.generateRefreshToken(user)).thenReturn("new-refresh-token");

        AuthResponseDTO response = authService.refreshToken(new RefreshTokenRequestDTO("refresh-token"));

        assertEquals("new-access-token", response.token());
        assertEquals("new-refresh-token", response.refreshToken());
    }

    @Test
    void rejectsInvalidRefreshToken() {
        User user = user("membro@teste.com");
        when(jwtService.extractUsername("expired-token")).thenReturn(user.getEmail());
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(jwtService.isTokenValid("expired-token", user)).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> authService.refreshToken(new RefreshTokenRequestDTO("expired-token")));

        assertEquals("Refresh token inválido ou expirado", exception.getMessage());
    }

    @Test
    void requestsResetForActiveUserAndStoresOnlyHashedToken() throws Exception {
        User user = user("membro@teste.com");
        when(passwordResetRateLimiter.tryAcquire("membro@teste.com", "127.0.0.1")).thenReturn(true);
        when(userRepository.findByEmail("membro@teste.com")).thenReturn(Optional.of(user));

        authService.requestPasswordReset(new ForgotPasswordRequestDTO(" MEMBRO@teste.com "), "127.0.0.1");

        ArgumentCaptor<PasswordResetToken> resetToken = ArgumentCaptor.forClass(PasswordResetToken.class);
        ArgumentCaptor<String> resetUrl = ArgumentCaptor.forClass(String.class);
        verify(passwordResetTokenRepository).invalidateUnusedTokensByUser(user);
        verify(passwordResetTokenRepository).save(resetToken.capture());
        verify(emailService).sendPasswordReset(eq(user.getEmail()), resetUrl.capture());
        verify(passwordResetAuditRepository).save(any(PasswordResetAudit.class));
        String rawToken = resetUrl.getValue().substring(resetUrl.getValue().indexOf("token=") + 6);
        assertEquals(sha256(rawToken), resetToken.getValue().getTokenHash());
        assertFalse(resetToken.getValue().isUsed());
        assertNotNull(resetToken.getValue().getExpiresAt());
    }

    @Test
    void doesNotCreateResetForInactiveUser() {
        User user = user("inativo@teste.com");
        user.setActive(false);
        when(passwordResetRateLimiter.tryAcquire(user.getEmail(), "127.0.0.1")).thenReturn(true);
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        authService.requestPasswordReset(new ForgotPasswordRequestDTO(user.getEmail()), "127.0.0.1");

        verify(passwordResetTokenRepository, never()).save(any(PasswordResetToken.class));
        verify(emailService, never()).sendPasswordReset(any(), any());
    }

    @Test
    void resetsPasswordWithValidUnusedToken() {
        User user = user("membro@teste.com");
        user.setSessionVersion(2L);
        PasswordResetToken token = PasswordResetToken.builder()
                .user(user).tokenHash(sha256("valid-token"))
                .expiresAt(LocalDateTime.now().plusMinutes(10)).used(false).build();
        when(passwordResetTokenRepository.findByTokenHash(sha256("valid-token"))).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("nova senha")).thenReturn("senha-codificada");

        authService.resetPassword(new ResetPasswordRequestDTO("valid-token", "nova senha"));

        assertEquals("senha-codificada", user.getPassword());
        assertEquals(3L, user.getSessionVersion());
        assertNotNull(user.getPasswordChangedAt());
        assertEquals(true, token.isUsed());
        verify(userRepository).save(user);
        verify(passwordResetTokenRepository).save(token);
        verify(passwordResetAuditRepository).save(any(PasswordResetAudit.class));
    }

    @Test
    void rejectsUsedOrExpiredResetToken() {
        User user = user("membro@teste.com");
        PasswordResetToken usedToken = PasswordResetToken.builder()
                .user(user).tokenHash(sha256("used-token"))
                .expiresAt(LocalDateTime.now().plusMinutes(10)).used(true).build();
        when(passwordResetTokenRepository.findByTokenHash(sha256("used-token"))).thenReturn(Optional.of(usedToken));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> authService.resetPassword(new ResetPasswordRequestDTO("used-token", "nova senha")));

        assertEquals("Link de redefinição inválido ou expirado.", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
        verify(passwordResetTokenRepository, never()).save(any(PasswordResetToken.class));
    }

    @Test
    void rejectsExpiredResetToken() {
        User user = user("membro@teste.com");
        PasswordResetToken expiredToken = PasswordResetToken.builder()
                .user(user).tokenHash(sha256("expired-token"))
                .expiresAt(LocalDateTime.now().minusSeconds(1)).used(false).build();
        when(passwordResetTokenRepository.findByTokenHash(sha256("expired-token"))).thenReturn(Optional.of(expiredToken));

        assertThrows(IllegalArgumentException.class,
                () -> authService.resetPassword(new ResetPasswordRequestDTO("expired-token", "nova senha")));

        verify(userRepository, never()).save(any(User.class));
    }

    private User user(String email) {
        return User.builder().id(UUID.randomUUID()).name("Usuário de teste").email(email)
                .password("senha").role(UserRole.MEMBER).active(true).sessionVersion(1L).build();
    }

    private String sha256(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder();
            for (byte currentByte : digest) {
                result.append(String.format("%02x", currentByte));
            }
            return result.toString();
        } catch (Exception exception) {
            throw new AssertionError(exception);
        }
    }
}
