package br.ufu.facom.petsi.controlaPET.dto.MovementDTO;

import br.ufu.facom.petsi.controlaPET.model.Item;
import br.ufu.facom.petsi.controlaPET.model.User;
import br.ufu.facom.petsi.controlaPET.model.enums.MovementType;

import java.time.LocalDateTime;

public record MovementResponseDTO(
        Long id,
        String userName,
        Long itemId,
        String itemName,
        MovementType type,
        String notes,
        int quantity,
        LocalDateTime movementDate
) {
}
