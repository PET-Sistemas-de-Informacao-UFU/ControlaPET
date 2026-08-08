package br.ufu.facom.petsi.controlaPET.dto.loanDTO;

import java.time.LocalDate;

public record CreateLoanRequestDTO(
        Long itemId,
        int quantity,
        LocalDate expectedReturnDate
) {
}
