package br.ufu.facom.petsi.controlaPET.service;

import br.ufu.facom.petsi.controlaPET.dto.MovementDTO.ConsumeItemRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.MovementDTO.CreateMovementRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.MovementDTO.MovementResponseDTO;
import br.ufu.facom.petsi.controlaPET.dto.MovementDTO.UserMovementHistoryResponseDTO;
import br.ufu.facom.petsi.controlaPET.model.Item;
import br.ufu.facom.petsi.controlaPET.model.Loan;
import br.ufu.facom.petsi.controlaPET.model.Movement;
import br.ufu.facom.petsi.controlaPET.model.User;
import br.ufu.facom.petsi.controlaPET.model.enums.ItemType;
import br.ufu.facom.petsi.controlaPET.model.enums.LoanStatus;
import br.ufu.facom.petsi.controlaPET.model.enums.MovementType;
import br.ufu.facom.petsi.controlaPET.repository.ItemRepository;
import br.ufu.facom.petsi.controlaPET.repository.LoanRepository;
import br.ufu.facom.petsi.controlaPET.repository.MovementRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MovementService {

    private final ItemRepository itemRepository;
    private final MovementRepository movementRepository;
    private final LoanRepository loanRepository;

    @Transactional
    public MovementResponseDTO createConsumeMovement(User user, ConsumeItemRequestDTO request) {
        Item item = itemRepository.findByIdForUpdate(request.itemId())
                .orElseThrow(() -> new IllegalArgumentException(("Item não encontrado")));

        if(item.getStockQuantity()- request.quantity()<0 || !item.getType().equals(ItemType.CONSUMABLE)){
            throw new RuntimeException(("Sem estoque o suficiente ou tipo não consumível"));
        }

        item.setTotalQuantity(item.getTotalQuantity()- request.quantity());
        item.setStockQuantity(item.getStockQuantity()-request.quantity());

        Movement movement = Movement.builder()
                .user(user)
                .item(item)
                .movementType(MovementType.OUTBOUND_CONSUMPTION)
                .quantity(request.quantity())
                .movementDate(LocalDateTime.now())
                .build();

        itemRepository.save(item);
        Movement newMovement = movementRepository.save(movement);

        return new MovementResponseDTO(
                newMovement.getId(),
                newMovement.getUser().getName(),
                newMovement.getItem().getId(),
                newMovement.getItem().getName(),
                newMovement.getMovementType(),
                newMovement.getNotes(),
                newMovement.getQuantity(),
                newMovement.getMovementDate()
        );
    }

    @Transactional
    public MovementResponseDTO createMovement(User user, CreateMovementRequestDTO request) {
        Item item = itemRepository.findByIdForUpdate(request.itemId())
                .orElseThrow(() -> new IllegalArgumentException(("Item não encontrado")));



        if(request.type().equals(MovementType.ADJUSTMENT)){
            if(item.getStockQuantity() - request.quantity()<0)
                throw new RuntimeException(("Sem estoque o suficiente"));

            item.setTotalQuantity(item.getTotalQuantity()-request.quantity());
            item.setStockQuantity(item.getStockQuantity()-request.quantity());
        }
        else if (request.type().equals(MovementType.INBOUND)){
            item.setTotalQuantity(item.getTotalQuantity()+request.quantity());
            item.setStockQuantity(item.getStockQuantity()+request.quantity());
        }

        Movement movement = Movement.builder()
                .user(user)
                .item(item)
                .movementType(request.type())
                .notes(request.notes())
                .quantity(request.quantity())
                .movementDate(LocalDateTime.now())
                .build();

        itemRepository.save(item);
        Movement newMovement = movementRepository.save(movement);

        return new MovementResponseDTO(
                newMovement.getId(),
                newMovement.getUser().getName(),
                newMovement.getItem().getId(),
                newMovement.getItem().getName(),
                newMovement.getMovementType(),
                newMovement.getNotes(),
                newMovement.getQuantity(),
                newMovement.getMovementDate()
        );
    }

    public Page<MovementResponseDTO> getAllMovements(Pageable pageable) {
        return movementRepository.findAll(pageable).map(
                movement -> new MovementResponseDTO(
                        movement.getId(),
                        movement.getUser().getName(),
                        movement.getItem().getId(),
                        movement.getItem().getName(),
                        movement.getMovementType(),
                        movement.getNotes(),
                        movement.getQuantity(),
                        movement.getMovementDate()
                )
        );
    }

    public Page<MovementResponseDTO> getAllUserMovements(User user, Pageable pageable) {
        return movementRepository.findAllByUser(user, pageable).map(
                movement -> new MovementResponseDTO(
                        movement.getId(),
                        movement.getUser().getName(),
                        movement.getItem().getId(),
                        movement.getItem().getName(),
                        movement.getMovementType(),
                        movement.getNotes(),
                        movement.getQuantity(),
                        movement.getMovementDate()
                )
        );
    }

    @Transactional
    public Page<UserMovementHistoryResponseDTO> getUserHistory(User user, Pageable pageable) {
        List<UserMovementHistoryResponseDTO> history = new java.util.ArrayList<>();

        for (Loan loan : loanRepository.findAllByUser(user, Pageable.unpaged()).getContent()) {
            if (loan.getStatus() == LoanStatus.COMPLETED && loan.getActualReturnDate() != null) {
                history.add(new UserMovementHistoryResponseDTO(
                        loan.getId(), "LOAN_RETURNED", loan.getItem().getName(), loan.getQuantity(),
                        null, loan.getActualReturnDate()
                ));
            }
        }

        for (Movement movement : movementRepository.findAllByUser(user, Pageable.unpaged()).getContent()) {
            if (movement.getMovementType() == MovementType.OUTBOUND_CONSUMPTION) {
                history.add(new UserMovementHistoryResponseDTO(
                        movement.getId(), "OUTBOUND_CONSUMPTION", movement.getItem().getName(),
                        movement.getQuantity(), movement.getNotes(), movement.getMovementDate()
                ));
            }
        }

        List<UserMovementHistoryResponseDTO> sortedHistory = history.stream()
                .sorted(Comparator.comparing(UserMovementHistoryResponseDTO::eventDate).reversed())
                .toList();
        int start = Math.toIntExact(pageable.getOffset());

        if (start >= sortedHistory.size()) {
            return new PageImpl<>(List.of(), pageable, sortedHistory.size());
        }

        int end = Math.min(start + pageable.getPageSize(), sortedHistory.size());
        return new PageImpl<>(sortedHistory.subList(start, end), pageable, sortedHistory.size());
    }

    public Page<MovementResponseDTO> getAllItemMovements(Long id, Pageable pageable) {
        return movementRepository.findAllByItemId(id, pageable).map(
                movement -> new MovementResponseDTO(
                        movement.getId(),
                        movement.getUser().getName(),
                        movement.getItem().getId(),
                        movement.getItem().getName(),
                        movement.getMovementType(),
                        movement.getNotes(),
                        movement.getQuantity(),
                        movement.getMovementDate()
                )
        );
    }
}
