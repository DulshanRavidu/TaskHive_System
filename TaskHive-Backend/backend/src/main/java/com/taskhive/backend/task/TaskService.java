package com.taskhive.backend.task;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.domain.JpaSort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taskhive.backend.auth.AuthenticatedUser;
import com.taskhive.backend.common.ForbiddenException;
import com.taskhive.backend.common.ResourceNotFoundException;
import com.taskhive.backend.user.UserEntity;
import com.taskhive.backend.user.UserRepository;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> getTasks(
        AuthenticatedUser currentUser,
        int page,
        int size,
        TaskStatus status,
        TaskPriority priority,
        String sortBy,
        String sortDir
    ) {
        Specification<TaskEntity> specification = (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();
        if (!currentUser.isAdmin()) {
            specification = specification.and(TaskSpecifications.hasOwnerId(currentUser.id()));
        }
        if (status != null) {
            specification = specification.and(TaskSpecifications.hasStatus(status));
        }
        if (priority != null) {
            specification = specification.and(TaskSpecifications.hasPriority(priority));
        }

        Pageable pageable = PageRequest.of(page, size, resolveSort(sortBy, sortDir));
        return taskRepository.findAll(specification, pageable).map(TaskResponse::from);
    }

    @Transactional(readOnly = true)
    public TaskResponse getTask(Long taskId, AuthenticatedUser currentUser) {
        return TaskResponse.from(requireAccessibleTask(taskId, currentUser));
    }

    @Transactional
    public TaskResponse createTask(TaskRequest request, AuthenticatedUser currentUser) {
        UserEntity owner = userRepository.findById(currentUser.id())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TaskEntity task = new TaskEntity();
        applyRequest(task, request);
        task.setOwner(owner);

        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updateTask(Long taskId, TaskRequest request, AuthenticatedUser currentUser) {
        TaskEntity task = requireAccessibleTask(taskId, currentUser);
        applyRequest(task, request);
        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(Long taskId, AuthenticatedUser currentUser) {
        TaskEntity task = requireAccessibleTask(taskId, currentUser);
        taskRepository.delete(task);
    }

    @Transactional
    public TaskResponse markComplete(Long taskId, AuthenticatedUser currentUser) {
        TaskEntity task = requireAccessibleTask(taskId, currentUser);
        task.setStatus(TaskStatus.DONE);
        return TaskResponse.from(taskRepository.save(task));
    }

    private TaskEntity requireAccessibleTask(Long taskId, AuthenticatedUser currentUser) {
        TaskEntity task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (!currentUser.isAdmin() && !task.getOwner().getId().equals(currentUser.id())) {
            throw new ForbiddenException("You do not have access to this task");
        }
        return task;
    }

    private void applyRequest(TaskEntity task, TaskRequest request) {
        task.setTitle(request.title().trim());
        task.setDescription(request.description().trim());
        task.setStatus(request.status());
        task.setPriority(request.priority());
        task.setDueDate(request.dueDate());
    }

    private Sort resolveSort(String sortBy, String sortDir) {
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        String normalizedSort = sortBy == null ? "dueDate" : sortBy;
        return switch (normalizedSort) {
            case "createdAt" -> Sort.by(direction, "createdAt");
            case "priority" -> JpaSort.unsafe(direction, "case priority when 'LOW' then 1 when 'MEDIUM' then 2 when 'HIGH' then 3 end");
            case "dueDate" -> Sort.by(direction, "dueDate");
            default -> Sort.by(direction, "dueDate");
        };
    }
}