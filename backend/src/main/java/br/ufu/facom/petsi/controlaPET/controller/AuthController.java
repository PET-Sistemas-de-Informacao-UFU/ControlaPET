package br.ufu.facom.petsi.controlaPET.controller;

import br.ufu.facom.petsi.controlaPET.dto.userDTO.AuthResponseDTO;
import br.ufu.facom.petsi.controlaPET.dto.userDTO.LoginRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.userDTO.RefreshTokenRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.userDTO.ForgotPasswordRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.userDTO.ResetPasswordRequestDTO;
import br.ufu.facom.petsi.controlaPET.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;
import br.ufu.facom.petsi.controlaPET.model.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    @Value("${app.auth.cookie-secure:false}")
    private boolean cookieSecure;
    @Value("${api.security.token.refresh.expiration}")
    private long refreshExpiration;

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal User user) {
        authService.logout(user);
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, cookie("", 0).toString()).build();
    }

    @PostMapping("/login")
    private ResponseEntity<Map<String, String>> login(@Valid @RequestBody LoginRequestDTO request,
            @RequestHeader(value = "X-Auth-Request", required = false) String header){
        requireAuthHeader(header);
        return tokenResponse(authService.login(request));
    }

    @PostMapping("/refresh")
    private ResponseEntity<Map<String, String>> refresh(@CookieValue(value = "refresh_token", required = false) String token,
            @RequestHeader(value = "X-Auth-Request", required = false) String header){
        requireAuthHeader(header);
        if (token == null || token.isBlank()) throw new org.springframework.security.authentication.BadCredentialsException("Sessão expirada.");
        return tokenResponse(authService.refreshToken(new RefreshTokenRequestDTO(token)));
    }

    private void requireAuthHeader(String header) {
        if (!"1".equals(header)) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
    }

    private ResponseEntity<Map<String, String>> tokenResponse(AuthResponseDTO response) {
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie(response.refreshToken(), refreshExpiration / 1000).toString())
                .body(Map.of("token", response.token()));
    }

    private ResponseCookie cookie(String value, long maxAgeSeconds) {
        return ResponseCookie.from("refresh_token", value).httpOnly(true).secure(cookieSecure)
                .sameSite("Strict").path("/api/auth").maxAge(Duration.ofSeconds(maxAgeSeconds)).build();
    }

    @PostMapping("/forgot-password")
    private ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO request, HttpServletRequest httpRequest) {
        authService.requestPasswordReset(request, httpRequest.getRemoteAddr());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reset-password")
    private ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO request) {
        authService.resetPassword(request);
        return ResponseEntity.noContent().build();
    }
}
