package br.ufu.facom.petsi.controlaPET.service;

import br.ufu.facom.petsi.controlaPET.dto.MovementDTO.ConsumeItemRequestDTO;
import br.ufu.facom.petsi.controlaPET.model.Item;
import br.ufu.facom.petsi.controlaPET.model.Movement;
import br.ufu.facom.petsi.controlaPET.model.User;
import br.ufu.facom.petsi.controlaPET.model.enums.ItemCondition;
import br.ufu.facom.petsi.controlaPET.model.enums.ItemType;
import br.ufu.facom.petsi.controlaPET.model.enums.UserRole;
import br.ufu.facom.petsi.controlaPET.repository.ItemRepository;
import br.ufu.facom.petsi.controlaPET.repository.LoanRepository;
import br.ufu.facom.petsi.controlaPET.repository.MovementRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MovementServiceTest {

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private MovementRepository movementRepository;

    @Mock
    private LoanRepository loanRepository;

    @InjectMocks
    private MovementService movementService;

    @Test
    void consumesItemAndDecreasesBothQuantities() {
        Item item = item(ItemType.CONSUMABLE, 5, 5);
        when(itemRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(item));
        when(movementRepository.save(any(Movement.class))).thenAnswer(invocation -> invocation.getArgument(0));

        movementService.createConsumeMovement(user(), new ConsumeItemRequestDTO(10L, 2));

        ArgumentCaptor<Movement> movementCaptor = ArgumentCaptor.forClass(Movement.class);
        verify(itemRepository).save(item);
        verify(movementRepository).save(movementCaptor.capture());
        assertEquals(3, item.getTotalQuantity());
        assertEquals(3, item.getStockQuantity());
        assertEquals(2, movementCaptor.getValue().getQuantity());
    }

    @Test
    void rejectsConsumptionWhenStockIsInsufficient() {
        Item item = item(ItemType.CONSUMABLE, 1, 1);
        when(itemRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(item));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> movementService.createConsumeMovement(user(), new ConsumeItemRequestDTO(10L, 2)));

        assertEquals("Sem estoque o suficiente ou tipo não consumível", exception.getMessage());
        assertEquals(1, item.getTotalQuantity());
        assertEquals(1, item.getStockQuantity());
        verify(itemRepository, never()).save(any(Item.class));
        verify(movementRepository, never()).save(any(Movement.class));
    }

    @Test
    void rejectsConsumptionForNonConsumableItem() {
        Item item = item(ItemType.BORROWABLE, 5, 5);
        when(itemRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(item));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> movementService.createConsumeMovement(user(), new ConsumeItemRequestDTO(10L, 1)));

        assertEquals("Sem estoque o suficiente ou tipo não consumível", exception.getMessage());
        verify(itemRepository, never()).save(any(Item.class));
        verify(movementRepository, never()).save(any(Movement.class));
    }

    private Item item(ItemType type, int totalQuantity, int stockQuantity) {
        return Item.builder()
                .id(10L)
                .name("Item de teste")
                .description("Descrição")
                .type(type)
                .condition(ItemCondition.GOOD)
                .totalQuantity(totalQuantity)
                .stockQuantity(stockQuantity)
                .build();
    }

    private User user() {
        return User.builder()
                .id(UUID.randomUUID())
                .name("Usuário de teste")
                .email("usuario@teste.com")
                .password("senha")
                .role(UserRole.MEMBER)
                .active(true)
                .build();
    }
}
