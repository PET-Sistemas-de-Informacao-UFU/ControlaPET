package br.ufu.facom.petsi.controlaPET.service;

import br.ufu.facom.petsi.controlaPET.dto.loanDTO.CreateLoanRequestDTO;
import br.ufu.facom.petsi.controlaPET.model.Item;
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
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@ActiveProfiles("test")
class LoanStockConcurrencyIntegrationTest {

    @Autowired
    private LoanService loanService;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private UserRepository userRepository;

    @AfterEach
    void cleanDatabase() {
        loanRepository.deleteAll();
        itemRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void allowsOnlyOneLoanWhenTwoRequestsCompeteForTheLastUnit() throws Exception {
        Item item = itemRepository.save(Item.builder()
                .name("Notebook")
                .description("Notebook para teste")
                .type(ItemType.BORROWABLE)
                .condition(ItemCondition.GOOD)
                .totalQuantity(1)
                .stockQuantity(1)
                .build());
        User user = userRepository.save(User.builder()
                .name("Usuário de teste")
                .email("usuario@teste.com")
                .password("senha")
                .role(UserRole.MEMBER)
                .active(true)
                .build());

        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(2);

        try {
            Future<Boolean> firstRequest = executor.submit(() -> createLoanWhenReleased(ready, start, user, item));
            Future<Boolean> secondRequest = executor.submit(() -> createLoanWhenReleased(ready, start, user, item));

            ready.await(2, TimeUnit.SECONDS);
            start.countDown();

            List<Boolean> results = List.of(
                    firstRequest.get(5, TimeUnit.SECONDS),
                    secondRequest.get(5, TimeUnit.SECONDS)
            );

            Item updatedItem = itemRepository.findById(item.getId()).orElseThrow();
            long activeLoans = loanRepository.findAll().stream()
                    .filter(loan -> loan.getStatus() == LoanStatus.ACTIVE)
                    .count();

            assertEquals(1, results.stream().filter(Boolean::booleanValue).count());
            assertEquals(0, updatedItem.getStockQuantity());
            assertEquals(1, activeLoans);
        } finally {
            executor.shutdownNow();
        }
    }

    private boolean createLoanWhenReleased(
            CountDownLatch ready,
            CountDownLatch start,
            User user,
            Item item
    ) throws InterruptedException {
        ready.countDown();
        start.await();

        try {
            loanService.createLoan(
                    user,
                    new CreateLoanRequestDTO(item.getId(), 1, LocalDate.now().plusDays(1))
            );
            return true;
        } catch (RuntimeException exception) {
            return false;
        }
    }
}
