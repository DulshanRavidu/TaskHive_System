package com.taskhive.backend.auth;

import com.taskhive.backend.user.UserEntity;
import com.taskhive.backend.user.UserRole;

public record UserResponse(Long id, String username, String email, UserRole role) {

    public static UserResponse from(UserEntity user) {
        return new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }
}