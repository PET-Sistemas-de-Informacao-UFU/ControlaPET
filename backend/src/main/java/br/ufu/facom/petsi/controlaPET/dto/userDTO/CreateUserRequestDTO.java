package br.ufu.facom.petsi.controlaPET.dto.userDTO;

import br.ufu.facom.petsi.controlaPET.model.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateUserRequestDTO(
        @NotBlank(message = "O nome é obrigatório.")
        String name,

        @NotBlank(message = "O e-mail é obrigatório.")
        @Email(message = "Formato de e-mail inválido.")
        String email,

        @NotNull(message = "O perfil (role) do usuário é obrigatório.")
        UserRole role
) {
}
