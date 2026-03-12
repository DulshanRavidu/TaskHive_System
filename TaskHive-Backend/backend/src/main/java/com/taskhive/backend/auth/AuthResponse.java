package com.taskhive.backend.auth;

public record AuthResponse(String token, UserResponse user) {
}