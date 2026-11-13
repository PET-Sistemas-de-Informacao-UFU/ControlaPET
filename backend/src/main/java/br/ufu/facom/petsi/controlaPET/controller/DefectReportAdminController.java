package br.ufu.facom.petsi.controlaPET.controller;

import br.ufu.facom.petsi.controlaPET.dto.defectReport.*;
import br.ufu.facom.petsi.controlaPET.model.enums.DefectReportStatus;
import br.ufu.facom.petsi.controlaPET.service.DefectReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/defect-reports")
@PreAuthorize("hasAuthority('ADMIN')")
@RequiredArgsConstructor
public class DefectReportAdminController {
    private final DefectReportService defectReportService;

    @GetMapping
    public ResponseEntity<Page<DefectReportResponseDTO>> getReports(
            @RequestParam(required = false) String itemName,
            @RequestParam(required = false) List<DefectReportStatus> status,
            @PageableDefault(size = 20, sort = {"createdAt", "id"}, direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(defectReportService.getReports(itemName, status, pageable));
    }

    @GetMapping("/summary")
    public ResponseEntity<DefectReportSummaryDTO> getSummary() {
        return ResponseEntity.ok(defectReportService.getSummary());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DefectReportResponseDTO> getReport(@PathVariable Long id) {
        return ResponseEntity.ok(defectReportService.getReport(id));
    }
}
