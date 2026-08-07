package br.ufu.facom.petsi.controlaPET.dto.userDTO;

import br.ufu.facom.petsi.controlaPET.model.enums.UserRole;

public record CreateUserRequestDTO(String name, String email, String password, UserRole role ) {
}
