package br.ufu.facom.petsi.controlaPET.dto.dashboard;

import java.util.List;

public record DashboardResponseDTO(
        long overdueLoans,
        long lowStockItems,
        long totalItems,
        long activeLoans,
        List<MovementSummaryDTO> latestMovements
) {}