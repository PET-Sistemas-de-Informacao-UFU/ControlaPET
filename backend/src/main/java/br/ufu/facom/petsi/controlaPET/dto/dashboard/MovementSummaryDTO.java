package br.ufu.facom.petsi.controlaPET.dto.dashboard;

import br.ufu.facom.petsi.controlaPET.model.enums.MovementType;

import java.time.LocalDate;

public record MovementSummaryDTO(
        Long id,
        String userName,
        String itemName,
        MovementType type,
        int quantity,
        LocalDate movementDate
) {
}
