package br.ufu.facom.petsi.controlaPET.service;

import br.ufu.facom.petsi.controlaPET.dto.userDTO.CreateUserRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.userDTO.ChangePasswordRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.userDTO.ChangeNameRequestDTO;
import br.ufu.facom.petsi.controlaPET.model.User;
import br.ufu.facom.petsi.controlaPET.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;

    @Transactional
    public void createUser(CreateUserRequestDTO request) {
        User existingUser = userRepository.findByEmail(request.email().trim()).orElse(null);
        if (existingUser != null) {
            if (existingUser.getPasswordChangedAt() == null) {
                authService.sendInitialPasswordSetup(existingUser);
                return;
            }
            throw new IllegalArgumentException("E-mail já cadastrado");
        }

        User user = User.builder()
                .name(request.name())
                .email(request.email().trim())
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .role(request.role())
                .active(true)
                .build();

        userRepository.save(user);
        authService.sendInitialPasswordSetup(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll(org.springframework.data.domain.Sort.by("name"));
    }

    public void changePassword(User user, ChangePasswordRequestDTO request) {
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("A senha atual está incorreta");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setPasswordChangedAt(LocalDateTime.now());
        incrementSessionVersion(user);
        userRepository.save(user);
    }

    public void changeName(User user, ChangeNameRequestDTO request) {
        user.setName(request.name().trim());
        userRepository.save(user);
    }

    public void changeRole(User authenticatedUser, UUID userId, br.ufu.facom.petsi.controlaPET.model.enums.UserRole role) {
        if (authenticatedUser.getId().equals(userId)) {
            throw new IllegalArgumentException("Não é possível alterar o próprio perfil.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));
        user.setRole(role);
        userRepository.save(user);
    }

    public void changeStatus(User authenticatedUser, UUID userId, boolean active) {
        if (authenticatedUser.getId().equals(userId) && !active) {
            throw new IllegalArgumentException("Não é possível desativar a própria conta.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));
        user.setActive(active);
        userRepository.save(user);
    }

    public void updateUser(User authenticatedUser, UUID userId, br.ufu.facom.petsi.controlaPET.dto.userDTO.UpdateUserRequestDTO request) {
        if (authenticatedUser.getId().equals(userId)) {
            throw new IllegalArgumentException("Altere os dados da própria conta pelo menu de usuário.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));
        userRepository.findByEmail(request.email().trim())
                .filter(foundUser -> !foundUser.getId().equals(userId))
                .ifPresent(foundUser -> { throw new IllegalArgumentException("E-mail já cadastrado"); });

        user.setName(request.name().trim());
        user.setEmail(request.email().trim());
        userRepository.save(user);
    }

    private void incrementSessionVersion(User user) {
        user.setSessionVersion(user.getSessionVersion() == null ? 1L : user.getSessionVersion() + 1);
    }
}
