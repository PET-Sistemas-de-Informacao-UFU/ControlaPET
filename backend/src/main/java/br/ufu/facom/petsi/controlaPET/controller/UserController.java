package br.ufu.facom.petsi.controlaPET.controller;

import br.ufu.facom.petsi.controlaPET.dto.userDTO.CreateUserRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.userDTO.ChangePasswordRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.userDTO.ChangeNameRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.userDTO.ChangeUserRoleRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.userDTO.ChangeUserStatusRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.userDTO.UpdateUserRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.userDTO.UserResponseDTO;
import br.ufu.facom.petsi.controlaPET.model.User;
import br.ufu.facom.petsi.controlaPET.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

     @PostMapping
     @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> createUser(@Valid @RequestBody CreateUserRequestDTO request){
        userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        List<UserResponseDTO> users = userService.getAllUsers().stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getUserDetails(@AuthenticationPrincipal User user){
        return ResponseEntity.ok(toResponse(user));
    }

    @PatchMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangePasswordRequestDTO request
    ) {
        userService.changePassword(user, request);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/me/name")
    public ResponseEntity<Void> changeName(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangeNameRequestDTO request
    ) {
        userService.changeName(user, request);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{userId}/role")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> changeRole(
            @AuthenticationPrincipal User authenticatedUser,
            @PathVariable java.util.UUID userId,
            @Valid @RequestBody ChangeUserRoleRequestDTO request
    ) {
        userService.changeRole(authenticatedUser, userId, request.role());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{userId}/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> changeStatus(
            @AuthenticationPrincipal User authenticatedUser,
            @PathVariable java.util.UUID userId,
            @Valid @RequestBody ChangeUserStatusRequestDTO request
    ) {
        userService.changeStatus(authenticatedUser, userId, request.active());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> updateUser(
            @AuthenticationPrincipal User authenticatedUser,
            @PathVariable java.util.UUID userId,
            @Valid @RequestBody UpdateUserRequestDTO request
    ) {
        userService.updateUser(authenticatedUser, userId, request);
        return ResponseEntity.noContent().build();
    }

    private UserResponseDTO toResponse(User user) {
        return new UserResponseDTO(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.isActive());
    }
}
