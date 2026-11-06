package br.ufu.facom.petsi.controlaPET.service;

import br.ufu.facom.petsi.controlaPET.model.enums.LoanStatus;
import br.ufu.facom.petsi.controlaPET.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class LoanStatusService {
    private final LoanRepository loanRepository;

    @Transactional
    public int markOverdue(LocalDate today) {
        return loanRepository.markOverdue(LoanStatus.ACTIVE, LoanStatus.OVERDUE, today);
    }
}
