package br.ufu.facom.petsi.controlaPET.service;

import br.ufu.facom.petsi.controlaPET.dto.defectReport.*;
import br.ufu.facom.petsi.controlaPET.model.*;
import br.ufu.facom.petsi.controlaPET.model.enums.DefectReportStatus;
import br.ufu.facom.petsi.controlaPET.model.enums.LoanStatus;
import br.ufu.facom.petsi.controlaPET.model.enums.UserRole;
import br.ufu.facom.petsi.controlaPET.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.ArrayList;
import jakarta.persistence.criteria.Predicate;

@Service
@RequiredArgsConstructor
public class DefectReportService {
    private final DefectReportRepository defectReportRepository;
    private final ItemRepository itemRepository;
    private final LoanRepository loanRepository;

    @Transactional
    public DefectReportResponseDTO createReport(User user, Long itemId, CreateDefectReportRequestDTO request) {
        // All loan-related operations lock loan -> item -> report, including returns.
        Loan loan = request.loanId() == null ? null : getLoanForUpdate(request.loanId());
        Item item = getItemForUpdate(itemId);
        if (loan != null) {
            if (!loan.getItem().getId().equals(itemId)) throw new IllegalArgumentException("Empréstimo não pertence ao item.");
            if (!loan.getUser().getId().equals(user.getId()) && user.getRole() != UserRole.ADMIN)
                throw new AccessDeniedException("Empréstimo não pertence ao usuário.");
            if (loan.getStatus() == LoanStatus.COMPLETED)
                throw new IllegalArgumentException("Para um empréstimo já devolvido, relate o defeito pelo catálogo.");
        }
        long maximum = loan == null ? item.getStockQuantity()
                : loan.getQuantity() - defectReportRepository.sumReservedQuantityByLoanId(loan.getId(), null);
        if (request.quantity() > maximum)
            throw new IllegalArgumentException("A quantidade afetada ultrapassa as unidades disponíveis na origem informada.");
        DefectReport report = DefectReport.builder().item(item).reportedBy(user).loan(loan)
                .quantity(request.quantity()).reservedQuantity(request.quantity())
                .description(request.description().trim()).status(DefectReportStatus.OPEN).build();
        if (loan == null) {
            item.setStockQuantity(item.getStockQuantity() - request.quantity());
            item.setMaintenanceQuantity(item.getMaintenanceQuantity() + request.quantity());
            report.setStockReservedAt(LocalDateTime.now());
        }
        return toResponse(defectReportRepository.saveAndFlush(report));
    }

    @Transactional(readOnly = true)
    public Page<DefectReportResponseDTO> getItemReports(Long itemId, Pageable pageable) {
        if (!itemRepository.existsById(itemId)) throw new IllegalArgumentException("Item não encontrado");
        return defectReportRepository.findAllByItemId(itemId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<DefectReportResponseDTO> getReports(String itemName, List<DefectReportStatus> statuses, Pageable pageable) {
        String search = itemName == null ? "" : itemName.trim().toLowerCase(Locale.ROOT);
        return defectReportRepository.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (!search.isEmpty()) {
                String escaped = search.replace("!", "!!").replace("%", "!%").replace("_", "!_");
                predicates.add(cb.like(cb.lower(root.get("item").get("name")), "%" + escaped + "%", '!'));
            }
            if (statuses != null && !statuses.isEmpty()) predicates.add(root.get("status").in(statuses));
            return cb.and(predicates.toArray(Predicate[]::new));
        }, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public DefectReportResponseDTO getReport(Long id) {
        return toResponse(defectReportRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Relato não encontrado")));
    }

    @Transactional(readOnly = true)
    public DefectReportSummaryDTO getSummary() {
        long open = 0, waiting = 0, maintenance = 0, closed = 0;
        for (var count : defectReportRepository.countByReportStatus()) {
            switch (count.getStatus()) {
                case OPEN -> open = count.getTotal();
                case WAITING_RETURN -> waiting = count.getTotal();
                case IN_MAINTENANCE -> maintenance = count.getTotal();
                default -> closed += count.getTotal();
            }
        }
        return new DefectReportSummaryDTO(open, waiting, maintenance, closed);
    }

    @Transactional
    public DefectReportResponseDTO confirmReport(User user, Long itemId, Long id, ConfirmDefectReportRequestDTO request) {
        Loan loan = lockReportLoan(id);
        Item item = getItemForUpdate(itemId);
        DefectReport report = getReportForUpdate(itemId, id);
        if (report.getStatus() != DefectReportStatus.OPEN)
            throw new IllegalArgumentException("Somente relatos abertos podem ser confirmados.");
        int quantity = request.quantity();
        if (report.getQuantity() != null && quantity > report.getQuantity())
            throw new IllegalArgumentException("A quantidade confirmada não pode ultrapassar a quantidade relatada.");
        if (loan != null && defectReportRepository.sumReservedQuantityByLoanId(loan.getId(), id) + quantity > loan.getQuantity())
            throw new IllegalArgumentException("Já existem unidades deste empréstimo reservadas em outros relatos.");
        int previousReservation = report.getActiveReservedQuantity();
        if (report.getStockReservedAt() != null) {
            int released = previousReservation - quantity;
            if (released < 0 || item.getMaintenanceQuantity() < previousReservation)
                throw new IllegalArgumentException("As quantidades do item estão inconsistentes com a reserva deste relato.");
            item.setStockQuantity(item.getStockQuantity() + released);
            item.setMaintenanceQuantity(item.getMaintenanceQuantity() - released);
        }
        report.setReservedQuantity(quantity);
        report.setConfirmedQuantity(quantity);
        report.setConfirmedBy(user);
        report.setConfirmedAt(LocalDateTime.now());
        if (loan != null && loan.getStatus() != LoanStatus.COMPLETED) {
            report.setStatus(DefectReportStatus.WAITING_RETURN);
        } else {
            if (report.getStockReservedAt() == null) {
                if (quantity > item.getStockQuantity())
                    throw new IllegalArgumentException("Não há unidades disponíveis suficientes para enviar à manutenção.");
                item.setStockQuantity(item.getStockQuantity() - quantity);
                item.setMaintenanceQuantity(item.getMaintenanceQuantity() + quantity);
                report.setStockReservedAt(LocalDateTime.now());
            }
            report.setMaintenanceStartedAt(LocalDateTime.now());
            report.setStatus(DefectReportStatus.IN_MAINTENANCE);
        }
        return toResponse(defectReportRepository.save(report));
    }

    @Transactional
    public DefectReportResponseDTO closeReport(User user, Long itemId, Long id, CloseDefectReportRequestDTO request) {
        if (request.status() != DefectReportStatus.RESOLVED
                && request.status() != DefectReportStatus.DISMISSED
                && request.status() != DefectReportStatus.WRITTEN_OFF)
            throw new IllegalArgumentException("Escolha reparo, descarte do relato ou baixa definitiva.");
        lockReportLoan(id);
        Item item = getItemForUpdate(itemId);
        DefectReport report = getReportForUpdate(itemId, id);
        if (report.getClosedAt() != null)
            throw new IllegalArgumentException("Este relato já foi encerrado.");
        if (report.getStatus() == DefectReportStatus.WAITING_RETURN)
            throw new IllegalArgumentException("Aguarde a devolução para concluir a avaliação das unidades.");
        if (report.getStatus() == DefectReportStatus.OPEN) {
            if (request.status() != DefectReportStatus.DISMISSED)
                throw new IllegalArgumentException("Confirme a manutenção antes de registrar reparo ou baixa definitiva.");
            if (report.getStockReservedAt() != null) {
                int quantity = report.getActiveReservedQuantity();
                if (item.getMaintenanceQuantity() < quantity)
                    throw new IllegalArgumentException("As quantidades do item estão inconsistentes com a reserva deste relato.");
                item.setMaintenanceQuantity(item.getMaintenanceQuantity() - quantity);
                item.setStockQuantity(item.getStockQuantity() + quantity);
            }
        } else if (report.getStatus() == DefectReportStatus.IN_MAINTENANCE) {
            if (request.status() == DefectReportStatus.DISMISSED)
                throw new IllegalArgumentException("A manutenção deve ser concluída com reparo ou baixa definitiva. Descartar se aplica apenas a relatos ainda não confirmados.");
            int quantity = report.getConfirmedQuantity();
            if (item.getMaintenanceQuantity() < quantity || item.getTotalQuantity() < quantity)
                throw new IllegalArgumentException("As quantidades do item estão inconsistentes com esta manutenção.");
            item.setMaintenanceQuantity(item.getMaintenanceQuantity() - quantity);
            if (request.status() == DefectReportStatus.WRITTEN_OFF) {
                item.setTotalQuantity(item.getTotalQuantity() - quantity);
            } else {
                item.setStockQuantity(item.getStockQuantity() + quantity);
            }
        } else {
            throw new IllegalArgumentException("Este relato já foi encerrado.");
        }
        report.setStatus(request.status());
        report.setClosedBy(user);
        report.setClosedAt(LocalDateTime.now());
        report.setResolutionNotes(request.resolutionNotes().trim());
        return toResponse(defectReportRepository.save(report));
    }

    private Loan lockReportLoan(Long id) {
        return defectReportRepository.findLoanIdById(id).map(this::getLoanForUpdate).orElse(null);
    }

    private Loan getLoanForUpdate(Long id) {
        return loanRepository.findByIdForUpdate(id).orElseThrow(() -> new IllegalArgumentException("Empréstimo não encontrado."));
    }

    private Item getItemForUpdate(Long id) {
        return itemRepository.findByIdForUpdate(id).orElseThrow(() -> new IllegalArgumentException("Item não encontrado"));
    }

    private DefectReport getReportForUpdate(Long itemId, Long id) {
        DefectReport report = defectReportRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new IllegalArgumentException("Relato não encontrado"));
        if (!report.getItem().getId().equals(itemId)) throw new IllegalArgumentException("Relato não pertence ao item");
        return report;
    }

    private DefectReportResponseDTO toResponse(DefectReport report) {
        return new DefectReportResponseDTO(report.getId(), report.getItem().getId(), report.getItem().getName(), report.getReportedBy().getName(),
                report.getDescription(), report.getStatus(), report.getCreatedAt(), report.getQuantity(), report.getConfirmedQuantity(),
                report.getActiveReservedQuantity(), report.getStockReservedAt(),
                report.getLoan() == null ? null : report.getLoan().getId(),
                report.getConfirmedBy() == null ? null : report.getConfirmedBy().getName(), report.getConfirmedAt(), report.getMaintenanceStartedAt(),
                report.getClosedBy() == null ? null : report.getClosedBy().getName(), report.getClosedAt(), report.getResolutionNotes());
    }
}
