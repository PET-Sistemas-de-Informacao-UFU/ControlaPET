package br.ufu.facom.petsi.controlaPET.service;

import br.ufu.facom.petsi.controlaPET.dto.audit.AuditEventResponseDTO;
import br.ufu.facom.petsi.controlaPET.model.Loan;
import br.ufu.facom.petsi.controlaPET.model.Movement;
import br.ufu.facom.petsi.controlaPET.model.enums.AuditEventType;
import br.ufu.facom.petsi.controlaPET.repository.LoanRepository;
import br.ufu.facom.petsi.controlaPET.repository.MovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final LoanRepository loanRepository;
    private final MovementRepository movementRepository;

    @Transactional(readOnly = true)
    public Page<AuditEventResponseDTO> getEvents(LocalDate date, String userName, Pageable pageable) {
        List<AuditEventResponseDTO> events = new ArrayList<>();

        for (Loan loan : loanRepository.findAll()) {
            events.add(new AuditEventResponseDTO(
                    loan.getId(), AuditEventType.LOAN_CREATED, loan.getUser().getName(),
                    loan.getItem().getId(), loan.getItem().getName(), loan.getQuantity(), loan.getCheckoutDate()
            ));

            if (loan.getActualReturnDate() != null) {
                events.add(new AuditEventResponseDTO(
                        loan.getId(), AuditEventType.LOAN_RETURNED, loan.getUser().getName(),
                        loan.getItem().getId(), loan.getItem().getName(), loan.getQuantity(), loan.getActualReturnDate()
                ));
            }
        }

        for (Movement movement : movementRepository.findAll()) {
            events.add(new AuditEventResponseDTO(
                    movement.getId(), AuditEventType.valueOf(movement.getMovementType().name()),
                    movement.getUser().getName(), movement.getItem().getId(), movement.getItem().getName(),
                    movement.getQuantity(), movement.getMovementDate()
            ));
        }

        String normalizedUserName = userName == null ? null : userName.trim().toLowerCase();
        List<AuditEventResponseDTO> filteredEvents = events.stream()
                .filter(event -> date == null || event.eventDate().toLocalDate().equals(date))
                .filter(event -> normalizedUserName == null || normalizedUserName.isBlank()
                        || event.userName().toLowerCase().contains(normalizedUserName))
                .sorted(Comparator.comparing(AuditEventResponseDTO::eventDate).reversed())
                .toList();

        int start = Math.toIntExact(pageable.getOffset());
        if (start >= filteredEvents.size()) {
            return new PageImpl<>(List.of(), pageable, filteredEvents.size());
        }

        int end = Math.min(start + pageable.getPageSize(), filteredEvents.size());
        return new PageImpl<>(filteredEvents.subList(start, end), pageable, filteredEvents.size());
    }
}
