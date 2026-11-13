package br.ufu.facom.petsi.controlaPET.service;

import org.springframework.stereotype.Component;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@Component
public class LoginRateLimiter {
    private static final int MAX_ATTEMPTS = 10;
    private static final int MAX_ENTRIES = 10000;
    private static final Duration WINDOW = Duration.ofMinutes(15);
    private final Map<String, Bucket> buckets = new HashMap<>();
    private record Bucket(Instant expiresAt, int attempts) {}

    public synchronized boolean tryAcquire(String email) {
        Instant now = Instant.now();
        String key = email.trim().toLowerCase(Locale.ROOT);
        Bucket bucket = buckets.get(key);
        if (bucket == null || !bucket.expiresAt().isAfter(now)) {
            if (buckets.size() >= MAX_ENTRIES) {
                buckets.values().removeIf(value -> !value.expiresAt().isAfter(now));
                if (buckets.size() >= MAX_ENTRIES && bucket == null) return false;
            }
            buckets.put(key, new Bucket(now.plus(WINDOW), 1));
            return true;
        }
        if (bucket.attempts() >= MAX_ATTEMPTS) return false;
        buckets.put(key, new Bucket(bucket.expiresAt(), bucket.attempts() + 1));
        return true;
    }
}
