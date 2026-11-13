package br.ufu.facom.petsi.controlaPET.dto.defectReport;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateDefectReportRequestDTO(
    @NotBlank(message = "Descreva o defeito encontrado.")
    @Size(max = 3000, message = "A descrição deve ter no máximo 3000 caracteres.")
    String description
) {}
