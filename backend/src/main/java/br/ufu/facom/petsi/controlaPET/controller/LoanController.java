package br.ufu.facom.petsi.controlaPET.controller;

import br.ufu.facom.petsi.controlaPET.dto.loanDTO.CreateLoanRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.loanDTO.LoanResponseDTO;
import br.ufu.facom.petsi.controlaPET.model.User;
import br.ufu.facom.petsi.controlaPET.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;

    @PostMapping
    public ResponseEntity<LoanResponseDTO> createLoan(@AuthenticationPrincipal User user,
                                                      @Valid @RequestBody CreateLoanRequestDTO request){

        LoanResponseDTO response = loanService.createLoan(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Page<LoanResponseDTO>> getUserLoans(
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 20,
                sort = "checkoutDate",
                direction = Sort.Direction.DESC
            ) Pageable pageable
    ){

        Page<LoanResponseDTO> response = loanService.getUserLoans(user, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<LoanResponseDTO>> getAllLoans(
            @PageableDefault(size = 20,
                    sort = "checkoutDate",
                    direction = Sort.Direction.DESC
            ) Pageable pageable
    ){
        Page<LoanResponseDTO> response = loanService.getAllLoans(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pending")
    public ResponseEntity<Page<LoanResponseDTO>> getUserPendingLoans(
            @AuthenticationPrincipal User user,
            @PageableDefault(
                    sort = "checkoutDate",
                    direction = Sort.Direction.DESC
            ) Pageable pageable
    ){
        Page<LoanResponseDTO> response = loanService.getUserPendingLoans(user, pageable);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/return")
    public ResponseEntity<LoanResponseDTO> returnLoan(@AuthenticationPrincipal User user,
                                                      @PathVariable Long id){

        LoanResponseDTO response = loanService.returnLoan(user, id);
        return ResponseEntity.ok(response);
    }
}
