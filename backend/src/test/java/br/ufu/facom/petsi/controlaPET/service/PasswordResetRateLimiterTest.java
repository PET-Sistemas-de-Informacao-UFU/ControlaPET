package br.ufu.facom.petsi.controlaPET.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PasswordResetRateLimiterTest {

    private PasswordResetRateLimiter rateLimiter;

    @BeforeEach
    void setUp() {
        rateLimiter = new PasswordResetRateLimiter();
        ReflectionTestUtils.setField(rateLimiter, "emailMaxAttempts", 2);
        ReflectionTestUtils.setField(rateLimiter, "ipMaxAttempts", 3);
        ReflectionTestUtils.setField(rateLimiter, "windowMinutes", 15L);
    }

    @Test
    void blocksFurtherRequestsAfterEmailLimit() {
        assertTrue(rateLimiter.tryAcquire("membro@teste.com", "127.0.0.1"));
        assertTrue(rateLimiter.tryAcquire("membro@teste.com", "127.0.0.1"));

        assertFalse(rateLimiter.tryAcquire("membro@teste.com", "127.0.0.1"));
    }

    @Test
    void blocksFurtherRequestsAfterIpLimitEvenForDifferentEmails() {
        assertTrue(rateLimiter.tryAcquire("primeiro@teste.com", "127.0.0.1"));
        assertTrue(rateLimiter.tryAcquire("segundo@teste.com", "127.0.0.1"));
        assertTrue(rateLimiter.tryAcquire("terceiro@teste.com", "127.0.0.1"));

        assertFalse(rateLimiter.tryAcquire("quarto@teste.com", "127.0.0.1"));
    }
}
