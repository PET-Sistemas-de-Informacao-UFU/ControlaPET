package br.ufu.facom.petsi.controlaPET.dto.defectReport;

import br.ufu.facom.petsi.controlaPET.model.enums.DefectReportStatus;
import java.time.LocalDateTime;

public record DefectReportResponseDTO(
    Long id, Long itemId, String reportedByName, String description,
    DefectReportStatus status, LocalDateTime createdAt,
    Integer quantity, Integer confirmedQuantity, Long loanId,
    String confirmedByName, LocalDateTime confirmedAt, LocalDateTime maintenanceStartedAt,
    String closedByName, LocalDateTime closedAt, String resolutionNotes
) {}
