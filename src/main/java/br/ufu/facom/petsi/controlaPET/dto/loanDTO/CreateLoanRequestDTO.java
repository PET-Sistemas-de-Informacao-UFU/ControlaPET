package br.ufu.facom.petsi.controlaPET.dto.loanDTO;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreateLoanRequestDTO(
        @NotNull(message = "O ID do item é obrigatório.")
        Long itemId,

        @Min(value = 1, message = "A quantidade solicitada deve ser de pelo menos 1 item.")
        int quantity,

        @NotNull(message = "A data prevista de devolução é obrigatória.")
        @FutureOrPresent(message = "A data de devolução não pode estar no passado.")
        LocalDate expectedReturnDate
) {
}
