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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

        Loan newLoan = loanRepository.save(loan);

        return new LoanResponseDTO(
                newLoan.getId(),
                user.getName(),
                newLoan.getItem().getId(),
                newLoan.getItem().getName(),
                newLoan.getQuantity(),
                newLoan.getCheckoutDate(),
                newLoan.getExpectedReturnDate(),
                newLoan.getActualReturnDate(),
                newLoan.getStatus()
        );
    }

    public Page<LoanResponseDTO> getUserLoans(User user, Pageable pageable) {
        return loanRepository.findAllByUser(user, pageable).map(
                loan -> new LoanResponseDTO(
                        loan.getId(),
                        loan.getUser().getName(),
                        loan.getItem().getId(),
                        loan.getItem().getName(),
                        loan.getQuantity(),
                        loan.getCheckoutDate(),
                        loan.getExpectedReturnDate(),
                        loan.getActualReturnDate(),
                        loan.getStatus()
                )
        );
    }

    public Page<LoanResponseDTO> getAllLoans(Pageable pageable) {
        return loanRepository.findAll(pageable).map(
                loan -> new LoanResponseDTO(
                        loan.getId(),
                        loan.getUser().getName(),
                        loan.getItem().getId(),
                        loan.getItem().getName(),
                        loan.getQuantity(),
                        loan.getCheckoutDate(),
                        loan.getExpectedReturnDate(),
                        loan.getActualReturnDate(),
                        loan.getStatus()
                )
        );
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
                newLoan.getUser().getName(),
                newLoan.getItem().getId(),
                newLoan.getItem().getName(),
                loan.getQuantity(),
                newLoan.getCheckoutDate(),
                newLoan.getExpectedReturnDate(),
                newLoan.getActualReturnDate(),
                newLoan.getStatus()
        );
    }


    public Page<LoanResponseDTO> getUserPendingLoans(User user, Pageable pageable) {
        List<LoanStatus> statusPendents = List.of(LoanStatus.ACTIVE, LoanStatus.OVERDUE);

        return loanRepository.findAllByUserAndStatusIn(user, statusPendents, pageable)
                .map(
                        loan -> new LoanResponseDTO(
                                loan.getId(),
                                loan.getUser().getName(),
                                loan.getItem().getId(),
                                loan.getItem().getName(),
                                loan.getQuantity(),
                                loan.getCheckoutDate(),
                                loan.getExpectedReturnDate(),
                                loan.getActualReturnDate(),
                                loan.getStatus()
                        )
                );
    }
}