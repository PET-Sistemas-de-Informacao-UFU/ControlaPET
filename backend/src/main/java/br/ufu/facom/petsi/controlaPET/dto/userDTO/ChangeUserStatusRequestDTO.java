package br.ufu.facom.petsi.controlaPET.dto.userDTO;

import jakarta.validation.constraints.NotNull;

public record ChangeUserStatusRequestDTO(
        @NotNull(message = "O status do usuário é obrigatório.")
        Boolean active
) {
}
