package br.ufu.facom.petsi.controlaPET.service;

import br.ufu.facom.petsi.controlaPET.dto.userDTO.UpdateUserRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.userDTO.ChangePasswordRequestDTO;
import br.ufu.facom.petsi.controlaPET.model.User;
import br.ufu.facom.petsi.controlaPET.model.enums.UserRole;
import br.ufu.facom.petsi.controlaPET.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthService authService;

    @InjectMocks
    private UserService userService;

    @Test
    void rejectsChangingOwnRole() {
        User admin = user(UserRole.ADMIN, "admin@teste.com");

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> userService.changeRole(admin, admin.getId(), UserRole.MEMBER));

        assertEquals("Não é possível alterar o próprio perfil.", exception.getMessage());
        verifyNoInteractions(userRepository);
    }

    @Test
    void rejectsDeactivatingOwnAccount() {
        User admin = user(UserRole.ADMIN, "admin@teste.com");

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> userService.changeStatus(admin, admin.getId(), false));

        assertEquals("Não é possível desativar a própria conta.", exception.getMessage());
        verifyNoInteractions(userRepository);
    }

    @Test
    void allowsAdminToChangeAnotherUsersRole() {
        User admin = user(UserRole.ADMIN, "admin@teste.com");
        User member = user(UserRole.MEMBER, "membro@teste.com");
        when(userRepository.findById(member.getId())).thenReturn(Optional.of(member));

        userService.changeRole(admin, member.getId(), UserRole.ADMIN);

        assertEquals(UserRole.ADMIN, member.getRole());
        verify(userRepository).save(member);
    }

    @Test
    void rejectsUpdatingUserWithAnotherUsersEmail() {
        User admin = user(UserRole.ADMIN, "admin@teste.com");
        User target = user(UserRole.MEMBER, "alvo@teste.com");
        User existingUser = user(UserRole.MEMBER, "existente@teste.com");
        when(userRepository.findById(target.getId())).thenReturn(Optional.of(target));
        when(userRepository.findByEmail("existente@teste.com")).thenReturn(Optional.of(existingUser));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> userService.updateUser(
                        admin,
                        target.getId(),
                        new UpdateUserRequestDTO("Novo nome", "existente@teste.com")
                ));

        assertEquals("E-mail já cadastrado", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void changesPasswordAndInvalidatesPreviousSessions() {
        User member = user(UserRole.MEMBER, "membro@teste.com");
        member.setSessionVersion(4L);
        when(passwordEncoder.matches("senha atual", "senha")).thenReturn(true);
        when(passwordEncoder.encode("nova senha")).thenReturn("senha codificada");

        userService.changePassword(member, new ChangePasswordRequestDTO("senha atual", "nova senha"));

        assertEquals("senha codificada", member.getPassword());
        assertEquals(5L, member.getSessionVersion());
        assertNotNull(member.getPasswordChangedAt());
        verify(userRepository).save(member);
    }

    @Test
    void rejectsPasswordChangeWhenCurrentPasswordIsInvalid() {
        User member = user(UserRole.MEMBER, "membro@teste.com");
        when(passwordEncoder.matches("senha errada", "senha")).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> userService.changePassword(member, new ChangePasswordRequestDTO("senha errada", "nova senha")));

        assertEquals("A senha atual está incorreta", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    private User user(UserRole role, String email) {
        return User.builder()
                .id(UUID.randomUUID())
                .name("Usuário de teste")
                .email(email)
                .password("senha")
                .role(role)
                .active(true)
                .build();
    }
}
