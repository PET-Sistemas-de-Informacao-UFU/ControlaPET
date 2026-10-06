package br.ufu.facom.petsi.controlaPET.repository;

import br.ufu.facom.petsi.controlaPET.model.Loan;
import br.ufu.facom.petsi.controlaPET.model.User;
import br.ufu.facom.petsi.controlaPET.model.enums.LoanStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

public interface LoanRepository extends JpaRepository<Loan, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select loan from Loan loan where loan.id = :id")
    Optional<Loan> findByIdForUpdate(@Param("id") Long id);

    Page<Loan> findAllByUser(User user, Pageable pageable);

    Page<Loan> findAllByUserAndStatusIn(User user, List<LoanStatus> statusPendents, Pageable pageable);

    long countByStatus(LoanStatus loanStatus);
}
