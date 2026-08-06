package br.ufu.facom.petsi.controlaPET.dto;

import br.ufu.facom.petsi.controlaPET.model.enums.UserRole;

public record CreateUserRequestDTO(String name, String email, String password, UserRole role ) {
}
