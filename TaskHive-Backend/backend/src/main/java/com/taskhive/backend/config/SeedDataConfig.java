package com.taskhive.backend.config;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.taskhive.backend.task.TaskEntity;
import com.taskhive.backend.task.TaskPriority;
import com.taskhive.backend.task.TaskRepository;
import com.taskhive.backend.task.TaskStatus;
import com.taskhive.backend.user.UserEntity;
import com.taskhive.backend.user.UserRepository;
import com.taskhive.backend.user.UserRole;

@Configuration
public class SeedDataConfig {

    @Bean
    CommandLineRunner seedData(
        UserRepository userRepository,
        TaskRepository taskRepository,
        PasswordEncoder passwordEncoder,
        @Value("${app.seed.admin-email}") String adminEmail,
        @Value("${app.seed.admin-password}") String adminPassword
    ) {
        return args -> {
            if (userRepository.count() > 0) {
                return;
            }

            UserEntity admin = new UserEntity();
            admin.setUsername("admin");
            admin.setEmail(adminEmail.toLowerCase());
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
            admin.setRole(UserRole.ADMIN);

            UserEntity member = new UserEntity();
            member.setUsername("member");
            member.setEmail("member@taskhive.local");
            member.setPasswordHash(passwordEncoder.encode("member123"));
            member.setRole(UserRole.USER);

            userRepository.saveAll(List.of(admin, member));

            UserEntity savedAdmin = userRepository.findByEmailIgnoreCase(adminEmail)
                .orElseThrow();
            UserEntity savedMember = userRepository.findByEmailIgnoreCase("member@taskhive.local")
                .orElseThrow();

            taskRepository.save(task("Launch API integration", "Connect frontend to the real backend endpoints", TaskStatus.IN_PROGRESS, TaskPriority.HIGH, LocalDate.now().plusDays(2), savedAdmin));
            taskRepository.save(task("Prepare user onboarding", "Document the demo accounts and base workflows", TaskStatus.TODO, TaskPriority.MEDIUM, LocalDate.now().plusDays(5), savedAdmin));
            taskRepository.save(task("Review sprint backlog", "Refine estimates and confirm task priorities", TaskStatus.TODO, TaskPriority.LOW, LocalDate.now().plusDays(3), savedMember));
        };
    }

    private TaskEntity task(String title, String description, TaskStatus status, TaskPriority priority, LocalDate dueDate, UserEntity owner) {
        TaskEntity task = new TaskEntity();
        task.setTitle(title);
        task.setDescription(description);
        task.setStatus(status);
        task.setPriority(priority);
        task.setDueDate(dueDate);
        task.setOwner(owner);
        return task;
    }
}