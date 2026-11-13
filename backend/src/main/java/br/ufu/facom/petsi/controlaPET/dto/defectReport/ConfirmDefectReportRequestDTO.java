package br.ufu.facom.petsi.controlaPET.dto.defectReport;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ConfirmDefectReportRequestDTO(
        @NotNull(message = "Informe a quantidade confirmada.")
        @Min(value = 1, message = "A quantidade deve ser maior que zero.") Integer quantity
) {}
