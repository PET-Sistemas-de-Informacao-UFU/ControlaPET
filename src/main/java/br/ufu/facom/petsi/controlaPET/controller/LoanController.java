package br.ufu.facom.petsi.controlaPET.controller;

import br.ufu.facom.petsi.controlaPET.dto.loanDTO.CreateLoanRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.loanDTO.LoanResponseDTO;
import br.ufu.facom.petsi.controlaPET.model.User;
import br.ufu.facom.petsi.controlaPET.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<List<LoanResponseDTO>> getUserLoans(@AuthenticationPrincipal User user){
        List<LoanResponseDTO> response = loanService.getUserLoans(user);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<LoanResponseDTO>> getAllLoans(){
        List<LoanResponseDTO> response = loanService.getAllLoans();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<LoanResponseDTO>> getUserPendingLoans(@AuthenticationPrincipal User user){
        List<LoanResponseDTO> response = loanService.getUserPendingLoans(user);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/return")
    public ResponseEntity<LoanResponseDTO> returnLoan(@AuthenticationPrincipal User user,
                                                      @PathVariable Long id){

        LoanResponseDTO response = loanService.returnLoan(user, id);
        return ResponseEntity.ok(response);
    }
}
