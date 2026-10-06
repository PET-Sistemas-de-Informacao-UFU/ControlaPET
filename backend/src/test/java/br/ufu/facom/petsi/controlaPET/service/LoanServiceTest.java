package br.ufu.facom.petsi.controlaPET.service;

import br.ufu.facom.petsi.controlaPET.dto.loanDTO.CreateLoanRequestDTO;
import br.ufu.facom.petsi.controlaPET.model.Item;
import br.ufu.facom.petsi.controlaPET.model.Loan;
import br.ufu.facom.petsi.controlaPET.model.User;
import br.ufu.facom.petsi.controlaPET.model.enums.ItemCondition;
import br.ufu.facom.petsi.controlaPET.model.enums.ItemType;
import br.ufu.facom.petsi.controlaPET.model.enums.LoanStatus;
import br.ufu.facom.petsi.controlaPET.model.enums.UserRole;
import br.ufu.facom.petsi.controlaPET.repository.ItemRepository;
import br.ufu.facom.petsi.controlaPET.repository.LoanRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LoanServiceTest {

    @Mock
    private LoanRepository loanRepository;

    @Mock
    private ItemRepository itemRepository;

    @InjectMocks
    private LoanService loanService;

    @Test
    void createsLoanAndDecreasesAvailableStock() {
        Item item = item(10L, ItemType.BORROWABLE, 5, 5);
        User user = user();
        when(itemRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(item));
        when(loanRepository.save(any(Loan.class))).thenAnswer(invocation -> invocation.getArgument(0));

        loanService.createLoan(user, new CreateLoanRequestDTO(10L, 2, LocalDate.now().plusDays(1)));

        ArgumentCaptor<Loan> loanCaptor = ArgumentCaptor.forClass(Loan.class);
        verify(itemRepository).save(item);
        verify(loanRepository).save(loanCaptor.capture());
        assertEquals(3, item.getStockQuantity());
        assertEquals(2, loanCaptor.getValue().getQuantity());
        assertEquals(LoanStatus.ACTIVE, loanCaptor.getValue().getStatus());
    }

    @Test
    void rejectsLoanWhenStockIsInsufficient() {
        Item item = item(10L, ItemType.BORROWABLE, 1, 1);
        when(itemRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(item));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> loanService.createLoan(user(), new CreateLoanRequestDTO(10L, 2, LocalDate.now().plusDays(1))));

        assertEquals("Estoque insuficiente", exception.getMessage());
        assertEquals(1, item.getStockQuantity());
        verify(itemRepository, never()).save(any(Item.class));
        verify(loanRepository, never()).save(any(Loan.class));
    }

    @Test
    void rejectsLoanForNonBorrowableItem() {
        Item item = item(10L, ItemType.CONSUMABLE, 5, 5);
        when(itemRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(item));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> loanService.createLoan(user(), new CreateLoanRequestDTO(10L, 1, LocalDate.now().plusDays(1))));

        assertEquals("Item sem estoque ou não emprestável", exception.getMessage());
        verify(itemRepository, never()).save(any(Item.class));
        verify(loanRepository, never()).save(any(Loan.class));
    }

    @Test
    void returnsLoanOnlyOnceAndRestoresStock() {
        Item item = item(10L, ItemType.BORROWABLE, 5, 3);
        Loan loan = Loan.builder()
                .id(20L)
                .user(user())
                .item(item)
                .quantity(2)
                .checkoutDate(java.time.LocalDateTime.now().minusDays(1))
                .expectedReturnDate(LocalDate.now())
                .status(LoanStatus.ACTIVE)
                .build();
        when(loanRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(loan));
        when(itemRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(item));
        when(loanRepository.save(any(Loan.class))).thenAnswer(invocation -> invocation.getArgument(0));

        loanService.returnLoan(loan.getUser(), 20L);

        assertEquals(LoanStatus.COMPLETED, loan.getStatus());
        assertEquals(5, item.getStockQuantity());
        verify(itemRepository).save(item);
        verify(loanRepository).save(loan);

        assertThrows(RuntimeException.class, () -> loanService.returnLoan(loan.getUser(), 20L));
        verify(itemRepository).save(item);
        verify(loanRepository).save(loan);
    }

    @Test
    void rejectsReturnByAnotherMember() {
        Item item = item(10L, ItemType.BORROWABLE, 1, 0);
        Loan loan = activeLoan(item, user());
        when(loanRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(loan));

        AccessDeniedException exception = assertThrows(AccessDeniedException.class,
                () -> loanService.returnLoan(user(), 20L));

        assertEquals("Loan não pertence ao usuário", exception.getMessage());
        assertEquals(LoanStatus.ACTIVE, loan.getStatus());
        assertEquals(0, item.getStockQuantity());
        verify(itemRepository, never()).findByIdForUpdate(any());
        verify(loanRepository, never()).save(any(Loan.class));
    }

    @Test
    void allowsAdminToReturnLoanOwnedByAnotherUser() {
        Item item = item(10L, ItemType.BORROWABLE, 1, 0);
        Loan loan = activeLoan(item, user());
        User admin = user(UserRole.ADMIN);
        when(loanRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(loan));
        when(itemRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(item));
        when(loanRepository.save(any(Loan.class))).thenAnswer(invocation -> invocation.getArgument(0));

        loanService.returnLoan(admin, 20L);

        assertEquals(LoanStatus.COMPLETED, loan.getStatus());
        assertEquals(1, item.getStockQuantity());
        verify(itemRepository).save(item);
        verify(loanRepository).save(loan);
    }

    private Loan activeLoan(Item item, User owner) {
        return Loan.builder()
                .id(20L)
                .user(owner)
                .item(item)
                .quantity(1)
                .checkoutDate(java.time.LocalDateTime.now().minusDays(1))
                .expectedReturnDate(LocalDate.now())
                .status(LoanStatus.ACTIVE)
                .build();
    }

    private Item item(Long id, ItemType type, int totalQuantity, int stockQuantity) {
        return Item.builder()
                .id(id)
                .name("Item de teste")
                .description("Descrição")
                .type(type)
                .condition(ItemCondition.GOOD)
                .totalQuantity(totalQuantity)
                .stockQuantity(stockQuantity)
                .build();
    }

    private User user() {
        return user(UserRole.MEMBER);
    }

    private User user(UserRole role) {
        return User.builder()
                .id(UUID.randomUUID())
                .name("Usuário de teste")
                .email("usuario@teste.com")
                .password("senha")
                .role(role)
                .active(true)
                .build();
    }
}
