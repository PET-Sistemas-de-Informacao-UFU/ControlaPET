package br.ufu.facom.petsi.controlaPET.service;

import br.ufu.facom.petsi.controlaPET.dto.dashboard.DashboardResponseDTO;
import br.ufu.facom.petsi.controlaPET.dto.dashboard.MovementSummaryDTO;
import br.ufu.facom.petsi.controlaPET.model.enums.LoanStatus;
import br.ufu.facom.petsi.controlaPET.repository.ItemRepository;
import br.ufu.facom.petsi.controlaPET.repository.LoanRepository;
import br.ufu.facom.petsi.controlaPET.repository.MovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ItemRepository itemRepository;
    private final LoanRepository loanRepository;
    private final MovementRepository movementRepository;

    public DashboardResponseDTO getDashboardSummary(){
        LocalDate today = LocalDate.now();

        long overdueLoans = loanRepository.countByStatus(LoanStatus.OVERDUE);

        long lowStockItems = itemRepository.countByTotalQuantityLessThanEqual(5);

        long totalItems = itemRepository.count();

        long activeLoans = loanRepository.countByStatus(LoanStatus.ACTIVE);

        List<MovementSummaryDTO> latestMovements = movementRepository.findTop5ByOrderByMovementDateDesc()
                .stream()
                .map(movement -> new MovementSummaryDTO(
                        movement.getId(),
                        movement.getUser().getName(),
                        movement.getItem().getName(),
                        movement.getMovementType(),
                        movement.getQuantity(),
                        movement.getMovementDate()
                ))
                .toList();

        return new DashboardResponseDTO(
                overdueLoans,
                lowStockItems,
                totalItems,
                activeLoans,
                latestMovements
        );
    }

}
