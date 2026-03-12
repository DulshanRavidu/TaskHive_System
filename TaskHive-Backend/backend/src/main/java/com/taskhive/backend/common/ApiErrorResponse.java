package com.taskhive.backend.common;

import java.util.Map;

public record ApiErrorResponse(String message, Map<String, String> errors) {

    public ApiErrorResponse(String message) {
        this(message, Map.of());
    }
}