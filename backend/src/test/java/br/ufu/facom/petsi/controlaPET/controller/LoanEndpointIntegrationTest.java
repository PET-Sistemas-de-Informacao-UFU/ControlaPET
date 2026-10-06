package br.ufu.facom.petsi.controlaPET.controller;

import br.ufu.facom.petsi.controlaPET.model.Item;
import br.ufu.facom.petsi.controlaPET.model.Loan;
import br.ufu.facom.petsi.controlaPET.model.User;
import br.ufu.facom.petsi.controlaPET.model.enums.ItemCondition;
import br.ufu.facom.petsi.controlaPET.model.enums.ItemType;
import br.ufu.facom.petsi.controlaPET.model.enums.LoanStatus;
import br.ufu.facom.petsi.controlaPET.model.enums.UserRole;
import br.ufu.facom.petsi.controlaPET.repository.ItemRepository;
import br.ufu.facom.petsi.controlaPET.repository.LoanRepository;
import br.ufu.facom.petsi.controlaPET.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LoanEndpointIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    @AfterEach
    void cleanDatabase() {
        loanRepository.deleteAll();
        itemRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void listsOnlyAuthenticatedUsersLoansAndAppliesPagination() throws Exception {
        User owner = saveUser("Dona", UserRole.MEMBER);
        User anotherUser = saveUser("Outro", UserRole.MEMBER);
        Item firstItem = saveItem("Primeiro item", 3);
        Item secondItem = saveItem("Segundo item", 3);
        Item otherItem = saveItem("Item de outra pessoa", 3);

        saveLoan(owner, firstItem, LoanStatus.ACTIVE, LocalDateTime.now().minusDays(2));
        saveLoan(owner, secondItem, LoanStatus.ACTIVE, LocalDateTime.now().minusDays(1));
        saveLoan(anotherUser, otherItem, LoanStatus.ACTIVE, LocalDateTime.now());

        mockMvc.perform(get("/api/loans/me?page=0&size=1").with(user(owner)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.totalPages").value(2))
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].userName").value("Dona"))
                .andExpect(jsonPath("$.content[0].itemName").value("Segundo item"));
    }

    @Test
    void ownerCanReturnOwnLoan() throws Exception {
        User owner = saveUser("Dona", UserRole.MEMBER);
        Item item = saveItem("Notebook", 0);
        Loan loan = saveLoan(owner, item, LoanStatus.ACTIVE, LocalDateTime.now());

        mockMvc.perform(patch("/api/loans/{id}/return", loan.getId()).with(user(owner)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        Loan returnedLoan = loanRepository.findById(loan.getId()).orElseThrow();
        assertEquals(LoanStatus.COMPLETED, returnedLoan.getStatus());
        assertEquals(1, itemRepository.findById(item.getId()).orElseThrow().getStockQuantity());
    }

    @Test
    void adminCanReturnAnotherUsersLoan() throws Exception {
        User owner = saveUser("Dona", UserRole.MEMBER);
        User admin = saveUser("Administrador", UserRole.ADMIN);
        Item item = saveItem("Projetor", 0);
        Loan loan = saveLoan(owner, item, LoanStatus.ACTIVE, LocalDateTime.now());

        mockMvc.perform(patch("/api/loans/{id}/return", loan.getId()).with(user(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        assertEquals(LoanStatus.COMPLETED, loanRepository.findById(loan.getId()).orElseThrow().getStatus());
    }

    @Test
    void memberCannotReturnAnotherUsersLoan() throws Exception {
        User owner = saveUser("Dona", UserRole.MEMBER);
        User anotherMember = saveUser("Outro", UserRole.MEMBER);
        Item item = saveItem("Câmera", 0);
        Loan loan = saveLoan(owner, item, LoanStatus.ACTIVE, LocalDateTime.now());

        mockMvc.perform(patch("/api/loans/{id}/return", loan.getId()).with(user(anotherMember)))
                .andExpect(status().isForbidden());

        assertEquals(LoanStatus.ACTIVE, loanRepository.findById(loan.getId()).orElseThrow().getStatus());
        assertEquals(0, itemRepository.findById(item.getId()).orElseThrow().getStockQuantity());
    }

    private User saveUser(String name, UserRole role) {
        return userRepository.save(User.builder()
                .name(name)
                .email(name.toLowerCase() + "@teste.com")
                .password("senha")
                .role(role)
                .active(true)
                .sessionVersion(0L)
                .build());
    }

    private Item saveItem(String name, int stockQuantity) {
        return itemRepository.save(Item.builder()
                .name(name)
                .description("Item para teste")
                .type(ItemType.BORROWABLE)
                .condition(ItemCondition.GOOD)
                .totalQuantity(stockQuantity + 1)
                .stockQuantity(stockQuantity)
                .build());
    }

    private Loan saveLoan(User user, Item item, LoanStatus status, LocalDateTime checkoutDate) {
        return loanRepository.save(Loan.builder()
                .user(user)
                .item(item)
                .quantity(1)
                .checkoutDate(checkoutDate)
                .expectedReturnDate(LocalDate.now().plusDays(7))
                .status(status)
                .build());
    }
}
