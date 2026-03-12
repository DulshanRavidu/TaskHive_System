package com.taskhive.backend.auth;

import com.taskhive.backend.user.UserRole;

public record AuthenticatedUser(Long id, String email, UserRole role) {

    public boolean isAdmin() {
        return role == UserRole.ADMIN;
    }
}