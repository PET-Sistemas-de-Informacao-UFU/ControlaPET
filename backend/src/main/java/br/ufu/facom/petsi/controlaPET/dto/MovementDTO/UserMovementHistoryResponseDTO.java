package br.ufu.facom.petsi.controlaPET.dto.MovementDTO;

import java.time.LocalDateTime;

public record UserMovementHistoryResponseDTO(
        Long sourceId,
        String type,
        String itemName,
        int quantity,
        String notes,
        LocalDateTime eventDate
) {
}
