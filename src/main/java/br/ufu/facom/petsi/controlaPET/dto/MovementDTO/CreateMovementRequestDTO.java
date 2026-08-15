package br.ufu.facom.petsi.controlaPET.dto.MovementDTO;

import br.ufu.facom.petsi.controlaPET.model.enums.MovementType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateMovementRequestDTO(
        @NotNull(message = "O ID do item é obrigatório.")
        Long itemId,

        @NotNull(message = "A quantidade movimentada é obrigatória.")
        @Min(value = 1, message = "A quantidade movimentada deve ser de pelo menos 1 item.")
        Integer quantity,

        @Size(max = 255, message = "A observação não pode ultrapassar 255 caracteres.")
        String notes,

        @NotNull(message = "O tipo de movimentação (ENTRADA, SAIDA, etc.) é obrigatório.")
        MovementType type
) {
}
