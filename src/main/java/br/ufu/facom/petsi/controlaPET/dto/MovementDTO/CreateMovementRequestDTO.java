package br.ufu.facom.petsi.controlaPET.dto.MovementDTO;

import br.ufu.facom.petsi.controlaPET.model.enums.MovementType;

public record CreateMovementRequestDTO(
        Long itemId,
        Integer quantity,
        String notes,
        MovementType type
) {
}
