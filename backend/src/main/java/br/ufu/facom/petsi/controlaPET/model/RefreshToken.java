package br.ufu.facom.petsi.controlaPET.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {
    @Id
    @Column(name = "token_hash", length = 64)
    private String tokenHash;
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;
}
