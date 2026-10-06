package br.ufu.facom.petsi.controlaPET.service;

import br.ufu.facom.petsi.controlaPET.dto.MovementDTO.UserMovementHistoryResponseDTO;
import br.ufu.facom.petsi.controlaPET.model.Item;
import br.ufu.facom.petsi.controlaPET.model.Loan;
import br.ufu.facom.petsi.controlaPET.model.Movement;
import br.ufu.facom.petsi.controlaPET.model.User;
import br.ufu.facom.petsi.controlaPET.model.enums.ItemCondition;
import br.ufu.facom.petsi.controlaPET.model.enums.ItemType;
import br.ufu.facom.petsi.controlaPET.model.enums.LoanStatus;
import br.ufu.facom.petsi.controlaPET.model.enums.MovementType;
import br.ufu.facom.petsi.controlaPET.model.enums.UserRole;
import br.ufu.facom.petsi.controlaPET.repository.ItemRepository;
import br.ufu.facom.petsi.controlaPET.repository.LoanRepository;
import br.ufu.facom.petsi.controlaPET.repository.MovementRepository;
import br.ufu.facom.petsi.controlaPET.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.sql.Timestamp;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@ActiveProfiles("test")
class MovementHistoryIntegrationTest {

    @Autowired
    private MovementService movementService;

    @Autowired
    private MovementRepository movementRepository;

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @AfterEach
    void cleanDatabase() {
        movementRepository.deleteAll();
        loanRepository.deleteAll();
        itemRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void returnsOnlyTheUsersConsumptionsAndReturnsInDescendingChronologicalOrder() {
        User owner = userRepository.save(user("dono@teste.com"));
        User otherUser = userRepository.save(user("outro@teste.com"));
        Item item = itemRepository.save(item());
        LocalDateTime now = LocalDateTime.now();

        Movement ownerMovement = movementRepository.save(Movement.builder()
                .user(owner)
                .item(item)
                .movementType(MovementType.OUTBOUND_CONSUMPTION)
                .quantity(1)
                .notes("Consumo próprio")
                .movementDate(now.minusHours(2))
                .build());
        movementRepository.save(Movement.builder()
                .user(otherUser)
                .item(item)
                .movementType(MovementType.OUTBOUND_CONSUMPTION)
                .quantity(1)
                .notes("Consumo de terceiro")
                .movementDate(now.minusHours(1))
                .build());
        loanRepository.save(Loan.builder()
                .user(owner)
                .item(item)
                .quantity(1)
                .checkoutDate(now.minusDays(2))
                .expectedReturnDate(LocalDate.now().minusDays(1))
                .actualReturnDate(now)
                .status(LoanStatus.COMPLETED)
                .build());
        jdbcTemplate.update(
                "UPDATE movements SET movement_date = ? WHERE id = ?",
                Timestamp.valueOf(now.minusHours(2)),
                ownerMovement.getId()
        );

        Page<UserMovementHistoryResponseDTO> history = movementService.getUserHistory(
                owner,
                PageRequest.of(0, 20)
        );

        List<UserMovementHistoryResponseDTO> entries = history.getContent();
        assertEquals(2, entries.size());
        assertEquals("LOAN_RETURNED", entries.get(0).type());
        assertEquals("OUTBOUND_CONSUMPTION", entries.get(1).type());
        assertEquals("Consumo próprio", entries.get(1).notes());
    }

    private User user(String email) {
        return User.builder()
                .name("Usuário de teste")
                .email(email)
                .password("senha")
                .role(UserRole.MEMBER)
                .active(true)
                .build();
    }

    private Item item() {
        return Item.builder()
                .name("Item de teste")
                .description("Descrição")
                .type(ItemType.CONSUMABLE)
                .condition(ItemCondition.GOOD)
                .totalQuantity(5)
                .stockQuantity(5)
                .build();
    }
}
