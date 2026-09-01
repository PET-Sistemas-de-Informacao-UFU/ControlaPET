package br.ufu.facom.petsi.controlaPET.repository;

import br.ufu.facom.petsi.controlaPET.model.Loan;
import br.ufu.facom.petsi.controlaPET.model.User;
import br.ufu.facom.petsi.controlaPET.model.enums.LoanStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Long> {
    Page<Loan> findAllByUser(User user, Pageable pageable);

    Page<Loan> findAllByUserAndStatusIn(User user, List<LoanStatus> statusPendents, Pageable pageable);

    long countByStatus(LoanStatus loanStatus);
}
