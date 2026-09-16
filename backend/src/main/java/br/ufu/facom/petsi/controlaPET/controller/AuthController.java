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

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    private ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request){
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    private ResponseEntity<AuthResponseDTO> refresh(@Valid @RequestBody RefreshTokenRequestDTO request){
        return ResponseEntity.ok(authService.refreshToken(request));
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
