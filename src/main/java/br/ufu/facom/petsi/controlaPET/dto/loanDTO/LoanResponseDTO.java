package br.ufu.facom.petsi.controlaPET.dto.loanDTO;

import br.ufu.facom.petsi.controlaPET.model.Item;
import br.ufu.facom.petsi.controlaPET.model.User;
import br.ufu.facom.petsi.controlaPET.model.enums.LoanStatus;

import java.time.LocalDate;

public record LoanResponseDTO(
        Long id,
        User user,
        Item item,
        int quantity,
        LocalDate checkoutDate,
        LocalDate expectedReturnDate,
        LocalDate actualReturnDate,
        LoanStatus status
) {
}