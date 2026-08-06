package br.ufu.facom.petsi.controlaPET.service;

import br.ufu.facom.petsi.controlaPET.dto.AuthResponseDTO;
import br.ufu.facom.petsi.controlaPET.dto.LoginRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.RefreshTokenRequestDTO;
import br.ufu.facom.petsi.controlaPET.model.User;
import br.ufu.facom.petsi.controlaPET.repository.UserRepository;
import br.ufu.facom.petsi.controlaPET.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;

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
}
