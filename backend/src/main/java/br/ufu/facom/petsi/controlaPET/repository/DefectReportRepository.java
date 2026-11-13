package br.ufu.facom.petsi.controlaPET.repository;

import br.ufu.facom.petsi.controlaPET.model.DefectReport;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface DefectReportRepository extends JpaRepository<DefectReport, Long> {
    @EntityGraph(attributePaths = {"reportedBy", "closedBy", "item"})
    Page<DefectReport> findAllByItemId(Long itemId, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from DefectReport r where r.id = :id")
    Optional<DefectReport> findByIdForUpdate(@Param("id") Long id);
}
