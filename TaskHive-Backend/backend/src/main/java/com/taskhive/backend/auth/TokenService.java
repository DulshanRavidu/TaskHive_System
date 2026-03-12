package com.taskhive.backend.auth;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class TokenService {

    private final Map<String, Long> tokens = new ConcurrentHashMap<>();

    public String issueToken(Long userId) {
        String token = UUID.randomUUID().toString();
        tokens.put(token, userId);
        return token;
    }

    public Optional<Long> resolveUserId(String token) {
        return Optional.ofNullable(tokens.get(token));
    }

    public void revokeToken(String token) {
        tokens.remove(token);
    }
}