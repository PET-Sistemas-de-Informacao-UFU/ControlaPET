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
        int maximum = loan == null ? item.getStockQuantity() : loan.getQuantity();
        if (request.quantity() > maximum)
            throw new IllegalArgumentException("A quantidade afetada ultrapassa as unidades disponíveis na origem informada.");
        DefectReport report = DefectReport.builder().item(item).reportedBy(user).loan(loan)
                .quantity(request.quantity()).description(request.description().trim()).status(DefectReportStatus.OPEN).build();
        return toResponse(defectReportRepository.saveAndFlush(report));
    }

    @Transactional(readOnly = true)
    public Page<DefectReportResponseDTO> getItemReports(Long itemId, Pageable pageable) {
        if (!itemRepository.existsById(itemId)) throw new IllegalArgumentException("Item não encontrado");
        return defectReportRepository.findAllByItemId(itemId, pageable).map(this::toResponse);
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
        if (loan != null && defectReportRepository.sumConfirmedQuantityByLoanId(loan.getId()) + quantity > loan.getQuantity())
            throw new IllegalArgumentException("Já existem unidades deste empréstimo reservadas em outros relatos.");
        report.setConfirmedQuantity(quantity);
        report.setConfirmedBy(user);
        report.setConfirmedAt(LocalDateTime.now());
        if (loan != null && loan.getStatus() != LoanStatus.COMPLETED) {
            report.setStatus(DefectReportStatus.WAITING_RETURN);
        } else {
            if (quantity > item.getStockQuantity())
                throw new IllegalArgumentException("Não há unidades disponíveis suficientes para enviar à manutenção.");
            item.setStockQuantity(item.getStockQuantity() - quantity);
            item.setMaintenanceQuantity(item.getMaintenanceQuantity() + quantity);
            report.setMaintenanceStartedAt(LocalDateTime.now());
            report.setStatus(DefectReportStatus.IN_MAINTENANCE);
        }
        return toResponse(defectReportRepository.save(report));
    }

    @Transactional
    public DefectReportResponseDTO closeReport(User user, Long itemId, Long id, CloseDefectReportRequestDTO request) {
        if (request.status() != DefectReportStatus.RESOLVED && request.status() != DefectReportStatus.DISMISSED)
            throw new IllegalArgumentException("Escolha resolvido ou descartado para encerrar o relato.");
        lockReportLoan(id);
        Item item = getItemForUpdate(itemId);
        DefectReport report = getReportForUpdate(itemId, id);
        if (report.getStatus() == DefectReportStatus.RESOLVED || report.getStatus() == DefectReportStatus.DISMISSED)
            throw new IllegalArgumentException("Este relato já foi encerrado.");
        if (report.getStatus() == DefectReportStatus.WAITING_RETURN)
            throw new IllegalArgumentException("Aguarde a devolução para concluir a avaliação das unidades.");
        if (report.getStatus() == DefectReportStatus.IN_MAINTENANCE) {
            int quantity = report.getConfirmedQuantity();
            item.setMaintenanceQuantity(item.getMaintenanceQuantity() - quantity);
            item.setStockQuantity(item.getStockQuantity() + quantity);
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
        return new DefectReportResponseDTO(report.getId(), report.getItem().getId(), report.getReportedBy().getName(),
                report.getDescription(), report.getStatus(), report.getCreatedAt(), report.getQuantity(), report.getConfirmedQuantity(),
                report.getLoan() == null ? null : report.getLoan().getId(),
                report.getConfirmedBy() == null ? null : report.getConfirmedBy().getName(), report.getConfirmedAt(), report.getMaintenanceStartedAt(),
                report.getClosedBy() == null ? null : report.getClosedBy().getName(), report.getClosedAt(), report.getResolutionNotes());
    }
}
