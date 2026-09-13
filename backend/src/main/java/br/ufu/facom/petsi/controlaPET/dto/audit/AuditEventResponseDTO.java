package br.ufu.facom.petsi.controlaPET.dto.audit;

import br.ufu.facom.petsi.controlaPET.model.enums.AuditEventType;

import java.time.LocalDate;

public record AuditEventResponseDTO(
        Long sourceId,
        AuditEventType type,
        String userName,
        Long itemId,
        String itemName,
        int quantity,
        LocalDate eventDate
) {
}
