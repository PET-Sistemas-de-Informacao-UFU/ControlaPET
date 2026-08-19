package br.ufu.facom.petsi.controlaPET.service;

import br.ufu.facom.petsi.controlaPET.dto.MovementDTO.ConsumeItemRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.MovementDTO.CreateMovementRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.MovementDTO.MovementResponseDTO;
import br.ufu.facom.petsi.controlaPET.model.Item;
import br.ufu.facom.petsi.controlaPET.model.Movement;
import br.ufu.facom.petsi.controlaPET.model.User;
import br.ufu.facom.petsi.controlaPET.model.enums.ItemType;
import br.ufu.facom.petsi.controlaPET.model.enums.MovementType;
import br.ufu.facom.petsi.controlaPET.repository.ItemRepository;
import br.ufu.facom.petsi.controlaPET.repository.MovementRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MovementService {

    private final ItemRepository itemRepository;
    private final MovementRepository movementRepository;

    @Transactional
    public MovementResponseDTO createConsumeMovement(User user, ConsumeItemRequestDTO request) {
        Item item = itemRepository.findById(request.itemId())
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
                .movementDate(LocalDate.now())
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
        Item item = itemRepository.findById(request.itemId())
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
                .movementDate(LocalDate.now())
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

    public List<MovementResponseDTO> getAllMovements() {
        return movementRepository.findAll().stream().map(
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
        ).toList();
    }

    public List<MovementResponseDTO> getAllUserMovements(User user) {
        return movementRepository.findAllByUser(user).stream().map(
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
        ).toList();
    }

    public List<MovementResponseDTO> getAllItemMovements(Long id) {
        return movementRepository.findAllByItemId(id).stream().map(
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
        ).toList();
    }
}
