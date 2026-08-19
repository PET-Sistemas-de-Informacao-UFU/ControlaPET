package br.ufu.facom.petsi.controlaPET.dto.MovementDTO;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ConsumeItemRequestDTO(
        @NotNull(message = "O ID do item é obrigatório.")
        Long itemId,

        @Min(value = 1, message = "A quantidade solicitada deve ser de pelo menos 1 item.")
        Integer quantity
) {
}
