package br.ufu.facom.petsi.controlaPET.controller;

import br.ufu.facom.petsi.controlaPET.dto.MovementDTO.ConsumeItemRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.MovementDTO.CreateMovementRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.MovementDTO.MovementResponseDTO;
import br.ufu.facom.petsi.controlaPET.model.User;
import br.ufu.facom.petsi.controlaPET.service.MovementService;
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
@RequestMapping("/api/movements")
@RequiredArgsConstructor
public class MovementController {

    private final MovementService movementService;

    @PostMapping("/consume")
    public ResponseEntity<MovementResponseDTO> createConsumeMovement(@AuthenticationPrincipal User user,
                                                                     @Valid @RequestBody ConsumeItemRequestDTO request){

        MovementResponseDTO response = movementService.createConsumeMovement(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<MovementResponseDTO> createMovement(@AuthenticationPrincipal User user,
                                                              @Valid @RequestBody CreateMovementRequestDTO request) {

        MovementResponseDTO response = movementService.createMovement(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<MovementResponseDTO>> getAllMovements(
            @PageableDefault(
                    size = 20,
                    sort = "movementDate",
                    direction = Sort.Direction.DESC
            ) Pageable pageable
    ){

        Page<MovementResponseDTO> response = movementService.getAllMovements(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Page<MovementResponseDTO>> getAllUserMovements(
            @AuthenticationPrincipal User user,
            @PageableDefault(
                    size = 20,
                    sort = "movementDate",
                    direction = Sort.Direction.DESC
            )Pageable pageable
    ){

        Page<MovementResponseDTO> response = movementService.getAllUserMovements(user, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/item/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<MovementResponseDTO>> getAllItemMovements(
            @PathVariable Long id,
            @PageableDefault(
                    size = 20,
                    sort = "movementDate",
                    direction = Sort.Direction.DESC
            )Pageable pageable
    ){

        Page<MovementResponseDTO> response = movementService.getAllItemMovements(id, pageable);
        return ResponseEntity.ok(response);
    }
}
