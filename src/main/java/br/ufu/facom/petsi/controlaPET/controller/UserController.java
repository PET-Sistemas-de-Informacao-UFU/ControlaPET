package br.ufu.facom.petsi.controlaPET.controller;

import br.ufu.facom.petsi.controlaPET.dto.userDTO.CreateUserRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.userDTO.UserResponseDTO;
import br.ufu.facom.petsi.controlaPET.model.User;
import br.ufu.facom.petsi.controlaPET.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

     @PostMapping
     @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> createUser(@RequestBody CreateUserRequestDTO request){
        userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getUserDetails(@AuthenticationPrincipal User user){
        return ResponseEntity.ok(new UserResponseDTO(user.getId(), user.getEmail(), user.getName(), user.getRole()));
    }
}
