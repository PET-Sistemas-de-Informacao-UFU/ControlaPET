package br.ufu.facom.petsi.controlaPET.controller;

import br.ufu.facom.petsi.controlaPET.dto.AuthResponseDTO;
import br.ufu.facom.petsi.controlaPET.dto.LoginRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.RefreshTokenRequestDTO;
import br.ufu.facom.petsi.controlaPET.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    private ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO request){
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    private ResponseEntity<AuthResponseDTO> refresh(@RequestBody RefreshTokenRequestDTO request){
        return ResponseEntity.ok(authService.refreshToken(request));
    }
}
