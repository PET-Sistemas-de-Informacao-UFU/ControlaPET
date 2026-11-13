package br.ufu.facom.petsi.controlaPET.dto.defectReport;

import br.ufu.facom.petsi.controlaPET.model.enums.DefectReportStatus;
import jakarta.validation.constraints.*;

public record CloseDefectReportRequestDTO(
    @NotNull(message = "Informe o status do relato.") DefectReportStatus status,
    @NotBlank(message = "Informe a solução ou o motivo do descarte.")
    @Size(max = 3000, message = "A observação deve ter no máximo 3000 caracteres.")
    String resolutionNotes
) {}
