package br.ufu.facom.petsi.controlaPET.dto.MovementDTO;

import br.ufu.facom.petsi.controlaPET.model.Item;
import br.ufu.facom.petsi.controlaPET.model.User;
import br.ufu.facom.petsi.controlaPET.model.enums.MovementType;

import java.time.LocalDate;

public record MovementResponseDTO(
        Long id,
        User user,
        Item item,
        MovementType type,
        String notes,
        int quantity,
        LocalDate movementDate
) {
}
