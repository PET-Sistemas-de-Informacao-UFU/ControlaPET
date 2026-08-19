package br.ufu.facom.petsi.controlaPET.repository;

import br.ufu.facom.petsi.controlaPET.model.Loan;
import br.ufu.facom.petsi.controlaPET.model.User;
import br.ufu.facom.petsi.controlaPET.model.enums.LoanStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findAllByUser(User user);

    List<Loan> findAllByUserAndStatusIn(User user, List<LoanStatus> statusPendents);

    long countByStatus(LoanStatus loanStatus);
}
