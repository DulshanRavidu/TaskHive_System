package com.taskhive.backend.task;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TaskRequest(
    @NotBlank(message = "Title is required")
    @Size(max = 180, message = "Title must be 180 characters or fewer")
    String title,

    @NotBlank(message = "Description is required")
    @Size(max = 4000, message = "Description must be 4000 characters or fewer")
    String description,

    @NotNull(message = "Status is required")
    TaskStatus status,

    @NotNull(message = "Priority is required")
    TaskPriority priority,

    @NotNull(message = "Due date is required")
    LocalDate dueDate
) {
}