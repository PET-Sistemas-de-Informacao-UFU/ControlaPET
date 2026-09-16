package br.ufu.facom.petsi.controlaPET.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class PasswordResetRateLimiter {
    private final ConcurrentHashMap<String, Deque<Instant>> attempts = new ConcurrentHashMap<>();

    @Value("${app.password-reset.rate-limit.email-max:3}")
    private int emailMaxAttempts;

    @Value("${app.password-reset.rate-limit.ip-max:10}")
    private int ipMaxAttempts;

    @Value("${app.password-reset.rate-limit.window-minutes:15}")
    private long windowMinutes;

    public boolean tryAcquire(String email, String ipAddress) {
        Instant now = Instant.now();
        return acquire("email:" + email, emailMaxAttempts, now)
                && acquire("ip:" + ipAddress, ipMaxAttempts, now);
    }

    private boolean acquire(String key, int maxAttempts, Instant now) {
        boolean[] allowed = new boolean[1];
        attempts.compute(key, (currentKey, timestamps) -> {
            Deque<Instant> currentAttempts = timestamps == null ? new ArrayDeque<>() : timestamps;
            Instant threshold = now.minus(Duration.ofMinutes(windowMinutes));
            while (!currentAttempts.isEmpty() && currentAttempts.peekFirst().isBefore(threshold)) {
                currentAttempts.removeFirst();
            }

            if (currentAttempts.size() >= maxAttempts) {
                allowed[0] = false;
            } else {
                currentAttempts.addLast(now);
                allowed[0] = true;
            }
            return currentAttempts;
        });
        return allowed[0];
    }
}
