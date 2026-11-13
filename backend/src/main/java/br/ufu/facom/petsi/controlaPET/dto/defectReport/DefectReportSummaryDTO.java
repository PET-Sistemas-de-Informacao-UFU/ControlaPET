package br.ufu.facom.petsi.controlaPET.dto.defectReport;

public record DefectReportSummaryDTO(long open, long waitingReturn, long inMaintenance, long closed) {}
