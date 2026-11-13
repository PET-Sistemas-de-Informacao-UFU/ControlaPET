package br.ufu.facom.petsi.controlaPET.controller;

import br.ufu.facom.petsi.controlaPET.dto.defectReport.*;
import br.ufu.facom.petsi.controlaPET.model.User;
import br.ufu.facom.petsi.controlaPET.service.DefectReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/items/{itemId}/defect-reports")
@RequiredArgsConstructor
public class DefectReportController {
    private final DefectReportService defectReportService;

    @PostMapping
    public ResponseEntity<DefectReportResponseDTO> createReport(@AuthenticationPrincipal User user,
            @PathVariable Long itemId, @Valid @RequestBody CreateDefectReportRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(defectReportService.createReport(user, itemId, request));
    }

    @GetMapping
    public ResponseEntity<Page<DefectReportResponseDTO>> getItemReports(@PathVariable Long itemId,
            @PageableDefault(size = 10, sort = {"createdAt", "id"}, direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(defectReportService.getItemReports(itemId, pageable));
    }

    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<DefectReportResponseDTO> confirmReport(@AuthenticationPrincipal User user,
            @PathVariable Long itemId, @PathVariable Long id,
            @Valid @RequestBody ConfirmDefectReportRequestDTO request) {
        return ResponseEntity.ok(defectReportService.confirmReport(user, itemId, id, request));
    }

    @PatchMapping("/{id}/close")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<DefectReportResponseDTO> closeReport(@AuthenticationPrincipal User user,
            @PathVariable Long itemId, @PathVariable Long id,
            @Valid @RequestBody CloseDefectReportRequestDTO request) {
        return ResponseEntity.ok(defectReportService.closeReport(user, itemId, id, request));
    }
}
