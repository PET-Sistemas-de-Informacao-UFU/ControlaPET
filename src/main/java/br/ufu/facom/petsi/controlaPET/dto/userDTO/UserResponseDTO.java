package br.ufu.facom.petsi.controlaPET.dto.userDTO;

import br.ufu.facom.petsi.controlaPET.model.enums.UserRole;

import java.util.UUID;

public record UserResponseDTO(UUID id, String nome, String email, UserRole role) {
}
