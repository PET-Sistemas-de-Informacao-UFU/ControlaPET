package br.ufu.facom.petsi.controlaPET.repository;

import br.ufu.facom.petsi.controlaPET.model.DefectReport;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.List;

public interface DefectReportRepository extends JpaRepository<DefectReport, Long> {
    @EntityGraph(attributePaths = {"reportedBy", "closedBy", "confirmedBy", "item"})
    Page<DefectReport> findAllByItemId(Long itemId, Pageable pageable);

    @Query(value = "select loan_id from defect_reports where id = :id", nativeQuery = true)
    Optional<Long> findLoanIdById(@Param("id") Long id);

    @Query("select coalesce(sum(r.confirmedQuantity), 0) from DefectReport r where r.loan.id = :loanId and r.confirmedAt is not null")
    long sumConfirmedQuantityByLoanId(@Param("loanId") Long loanId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from DefectReport r where r.loan.id = :loanId and r.status = br.ufu.facom.petsi.controlaPET.model.enums.DefectReportStatus.WAITING_RETURN order by r.id")
    List<DefectReport> findWaitingForReturn(@Param("loanId") Long loanId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from DefectReport r where r.id = :id")
    Optional<DefectReport> findByIdForUpdate(@Param("id") Long id);
}
