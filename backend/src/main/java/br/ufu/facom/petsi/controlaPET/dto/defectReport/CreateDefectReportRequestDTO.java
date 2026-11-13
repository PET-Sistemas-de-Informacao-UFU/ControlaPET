package br.ufu.facom.petsi.controlaPET.dto.defectReport;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateDefectReportRequestDTO(
    @NotBlank(message = "Descreva o defeito encontrado.")
    @Size(max = 3000, message = "A descrição deve ter no máximo 3000 caracteres.")
    String description,
    @NotNull(message = "Informe a quantidade afetada.")
    @Min(value = 1, message = "A quantidade deve ser maior que zero.") Integer quantity,
    @Positive(message = "Empréstimo inválido.") Long loanId
) {}
