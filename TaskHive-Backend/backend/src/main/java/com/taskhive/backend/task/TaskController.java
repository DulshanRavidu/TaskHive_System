package com.taskhive.backend.task;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.taskhive.backend.auth.AuthenticatedUser;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public Page<TaskResponse> getTasks(
        Authentication authentication,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) TaskStatus status,
        @RequestParam(required = false) TaskPriority priority,
        @RequestParam(defaultValue = "dueDate") String sortBy,
        @RequestParam(defaultValue = "asc") String sortDir
    ) {
        return taskService.getTasks(currentUser(authentication), page, size, status, priority, sortBy, sortDir);
    }

    @GetMapping("/{taskId}")
    public TaskResponse getTask(@PathVariable Long taskId, Authentication authentication) {
        return taskService.getTask(taskId, currentUser(authentication));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse createTask(@Valid @RequestBody TaskRequest request, Authentication authentication) {
        return taskService.createTask(request, currentUser(authentication));
    }

    @PutMapping("/{taskId}")
    public TaskResponse updateTask(
        @PathVariable Long taskId,
        @Valid @RequestBody TaskRequest request,
        Authentication authentication
    ) {
        return taskService.updateTask(taskId, request, currentUser(authentication));
    }

    @DeleteMapping("/{taskId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(@PathVariable Long taskId, Authentication authentication) {
        taskService.deleteTask(taskId, currentUser(authentication));
    }

    @PatchMapping("/{taskId}/complete")
    public TaskResponse markComplete(@PathVariable Long taskId, Authentication authentication) {
        return taskService.markComplete(taskId, currentUser(authentication));
    }

    private AuthenticatedUser currentUser(Authentication authentication) {
        return (AuthenticatedUser) authentication.getPrincipal();
    }
}