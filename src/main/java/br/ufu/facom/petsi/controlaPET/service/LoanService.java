package br.ufu.facom.petsi.controlaPET.service;

import br.ufu.facom.petsi.controlaPET.dto.loanDTO.CreateLoanRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.loanDTO.LoanResponseDTO;
import br.ufu.facom.petsi.controlaPET.model.Item;
import br.ufu.facom.petsi.controlaPET.model.Loan;
import br.ufu.facom.petsi.controlaPET.model.User;
import br.ufu.facom.petsi.controlaPET.model.enums.ItemType;
import br.ufu.facom.petsi.controlaPET.model.enums.LoanStatus;
import br.ufu.facom.petsi.controlaPET.model.enums.UserRole;
import br.ufu.facom.petsi.controlaPET.repository.ItemRepository;
import br.ufu.facom.petsi.controlaPET.repository.LoanRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.security.access.AccessDeniedException;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;
    private final ItemRepository itemRepository;

    @Transactional
    public LoanResponseDTO createLoan(User user, CreateLoanRequestDTO request) {
        Item item = itemRepository.findById(request.itemId())
                .orElseThrow(() -> new IllegalArgumentException("Item não encontrado"));

        if(item.getStockQuantity()==0 || !item.getType().equals(ItemType.BORROWABLE))
            throw new RuntimeException("Item sem estoque ou não emprestável");

        if(item.getStockQuantity()-request.quantity()<0)
            throw new RuntimeException("Estoque insuficiente");

        item.setStockQuantity(item.getStockQuantity()-request.quantity());
        itemRepository.save(item);

        Loan loan = Loan.builder()
                .user(user)
                .item(item)
                .quantity(request.quantity())
                .checkoutDate(LocalDate.now())
                .expectedReturnDate(request.expectedReturnDate())
                .status(LoanStatus.ACTIVE)
                .build();

        loanRepository.save(loan);

        return new LoanResponseDTO(
                loan.getId(),
                user,
                loan.getItem(),
                loan.getQuantity(),
                loan.getCheckoutDate(),
                loan.getExpectedReturnDate(),
                loan.getActualReturnDate(),
                loan.getStatus()
        );
    }

    public List<LoanResponseDTO> getUserLoans(User user) {
        return loanRepository.findAllByUser(user).stream().map(
                loan -> new LoanResponseDTO(
                        loan.getId(),
                        loan.getUser(),
                        loan.getItem(),
                        loan.getQuantity(),
                        loan.getCheckoutDate(),
                        loan.getExpectedReturnDate(),
                        loan.getActualReturnDate(),
                        loan.getStatus()
                )
        ).toList();
    }

    public List<LoanResponseDTO> getAllLoans() {
        return loanRepository.findAll().stream().map(
                loan -> new LoanResponseDTO(
                        loan.getId(),
                        loan.getUser(),
                        loan.getItem(),
                        loan.getQuantity(),
                        loan.getCheckoutDate(),
                        loan.getExpectedReturnDate(),
                        loan.getActualReturnDate(),
                        loan.getStatus()
                )
        ).toList();
    }

    @Transactional
    public LoanResponseDTO returnLoan(User user, Long id) {
        Loan loan = loanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Loan não encontrado"));

        if(loan.getStatus().equals(LoanStatus.COMPLETED))
            throw new RuntimeException("Esse empréstimo já foi devolvido");

        if(!user.getId().equals(loan.getUser().getId()) && !user.getRole().equals(UserRole.ADMIN))
            throw new AccessDeniedException("Loan não pertence ao usuário");

        loan.setActualReturnDate(LocalDate.now());
        loan.setStatus(LoanStatus.COMPLETED);

        loan.getItem().setStockQuantity(loan.getItem().getStockQuantity()+loan.getQuantity());

        itemRepository.save(loan.getItem());
        Loan newLoan = loanRepository.save(loan);

        return new LoanResponseDTO(
                newLoan.getId(),
                newLoan.getUser(),
                newLoan.getItem(),
                loan.getQuantity(),
                newLoan.getCheckoutDate(),
                newLoan.getExpectedReturnDate(),
                newLoan.getActualReturnDate(),
                newLoan.getStatus()
        );
    }


    public List<LoanResponseDTO> getUserPendingLoans(User user) {
        List<LoanStatus> statusPendents = List.of(LoanStatus.ACTIVE, LoanStatus.OVERDUE);

        return loanRepository.findAllByUserAndStatusIn(user, statusPendents)
                .stream().map(
                        loan -> new LoanResponseDTO(
                                loan.getId(),
                                loan.getUser(),
                                loan.getItem(),
                                loan.getQuantity(),
                                loan.getCheckoutDate(),
                                loan.getExpectedReturnDate(),
                                loan.getActualReturnDate(),
                                loan.getStatus()
                        )
                ).toList();
    }
}