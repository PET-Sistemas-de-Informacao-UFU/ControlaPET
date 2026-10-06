package br.ufu.facom.petsi.controlaPET.dto.userDTO;

import br.ufu.facom.petsi.controlaPET.model.enums.UserRole;
import jakarta.validation.constraints.NotNull;

public record ChangeUserRoleRequestDTO(
        @NotNull(message = "O perfil do usuário é obrigatório.")
        UserRole role
) {
}
