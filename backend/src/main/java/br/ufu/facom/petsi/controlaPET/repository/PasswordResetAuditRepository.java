package br.ufu.facom.petsi.controlaPET.repository;

import br.ufu.facom.petsi.controlaPET.model.PasswordResetAudit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PasswordResetAuditRepository extends JpaRepository<PasswordResetAudit, UUID> {
}
