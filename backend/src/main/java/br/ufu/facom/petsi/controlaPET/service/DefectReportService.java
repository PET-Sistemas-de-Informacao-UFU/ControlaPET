package br.ufu.facom.petsi.controlaPET.service;

import br.ufu.facom.petsi.controlaPET.dto.defectReport.*;
import br.ufu.facom.petsi.controlaPET.model.*;
import br.ufu.facom.petsi.controlaPET.model.enums.DefectReportStatus;
import br.ufu.facom.petsi.controlaPET.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DefectReportService {
    private final DefectReportRepository defectReportRepository;
    private final ItemRepository itemRepository;

    @Transactional
    public DefectReportResponseDTO createReport(User user, Long itemId, CreateDefectReportRequestDTO request) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item não encontrado"));
        DefectReport report = DefectReport.builder().item(item).reportedBy(user)
                .description(request.description().trim()).status(DefectReportStatus.OPEN).build();
        return toResponse(defectReportRepository.saveAndFlush(report));
    }

    @Transactional(readOnly = true)
    public Page<DefectReportResponseDTO> getItemReports(Long itemId, Pageable pageable) {
        if (!itemRepository.existsById(itemId)) throw new IllegalArgumentException("Item não encontrado");
        return defectReportRepository.findAllByItemId(itemId, pageable).map(this::toResponse);
    }

    @Transactional
    public DefectReportResponseDTO closeReport(User user, Long itemId, Long id, CloseDefectReportRequestDTO request) {
        if (request.status() == DefectReportStatus.OPEN)
            throw new IllegalArgumentException("Escolha resolvido ou descartado para encerrar o relato.");
        DefectReport report = defectReportRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new IllegalArgumentException("Relato não encontrado"));
        if (!report.getItem().getId().equals(itemId)) throw new IllegalArgumentException("Relato não pertence ao item");
        if (report.getStatus() != DefectReportStatus.OPEN) throw new IllegalArgumentException("Este relato já foi encerrado.");
        report.setStatus(request.status());
        report.setClosedBy(user);
        report.setClosedAt(LocalDateTime.now());
        report.setResolutionNotes(request.resolutionNotes().trim());
        return toResponse(defectReportRepository.save(report));
    }

    private DefectReportResponseDTO toResponse(DefectReport report) {
        return new DefectReportResponseDTO(report.getId(), report.getItem().getId(), report.getReportedBy().getName(),
                report.getDescription(), report.getStatus(), report.getCreatedAt(),
                report.getClosedBy() == null ? null : report.getClosedBy().getName(), report.getClosedAt(), report.getResolutionNotes());
    }
}
