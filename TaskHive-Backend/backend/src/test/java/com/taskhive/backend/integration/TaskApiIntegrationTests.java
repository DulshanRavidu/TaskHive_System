package com.taskhive.backend.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskhive.backend.user.UserEntity;
import com.taskhive.backend.user.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TaskApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void ensureMemberUserExists() {
        userRepository.findByEmailIgnoreCase("member@taskhive.local").orElseGet(() -> {
            UserEntity user = new UserEntity();
            user.setUsername("member");
            user.setEmail("member@taskhive.local");
            user.setPasswordHash("unused");
            user.setRole(com.taskhive.backend.user.UserRole.USER);
            return userRepository.save(user);
        });
    }

    @Test
    void registerThenLoginReturnsTokenAndUser() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      \"username\": \"sara\",
                      \"email\": \"sara@example.com\",
                      \"password\": \"secret123\"
                    }
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.email").value("sara@example.com"))
            .andExpect(jsonPath("$.role").value("USER"));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      \"email\": \"sara@example.com\",
                      \"password\": \"secret123\"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.username").value("sara"));
    }

    @Test
    void authenticatedUserCanCreateFilterUpdateAndCompleteTasks() throws Exception {
        String token = login("admin@taskhive.local", "admin123");

        MvcResult createResult = mockMvc.perform(post("/api/tasks")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(taskPayload("Build integration tests", "Cover auth and task APIs", "TODO", "HIGH", LocalDate.now().plusDays(4))))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.title").value("Build integration tests"))
            .andReturn();

        Long taskId = readJson(createResult).get("id").asLong();

        mockMvc.perform(get("/api/tasks")
                .header("Authorization", bearer(token))
                .param("status", "TODO")
                .param("priority", "HIGH")
                .param("sortBy", "createdAt")
                .param("sortDir", "desc"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].id").value(taskId));

        mockMvc.perform(put("/api/tasks/{taskId}", taskId)
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(taskPayload("Build integration tests", "Expanded regression coverage", "IN_PROGRESS", "MEDIUM", LocalDate.now().plusDays(6))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
            .andExpect(jsonPath("$.priority").value("MEDIUM"));

        mockMvc.perform(patch("/api/tasks/{taskId}/complete", taskId)
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("DONE"));

        mockMvc.perform(delete("/api/tasks/{taskId}", taskId)
                .header("Authorization", bearer(token)))
            .andExpect(status().isNoContent());
    }

    @Test
    void standardUserOnlySeesOwnedTasks() throws Exception {
        String token = login("member@taskhive.local", "member123");

        mockMvc.perform(get("/api/tasks")
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(1))
            .andExpect(jsonPath("$.content[0].title").value("Review sprint backlog"));
    }

    private String login(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      \"email\": \"%s\",
                      \"password\": \"%s\"
                    }
                    """.formatted(email, password)))
            .andExpect(status().isOk())
            .andReturn();
        // Token is now in the HTTP-only cookie; extract it for use in Authorization header
        jakarta.servlet.http.Cookie sessionCookie = result.getResponse().getCookie("taskhive_session");
        if (sessionCookie == null) throw new IllegalStateException("No taskhive_session cookie in login response");
        return sessionCookie.getValue();
    }

    private JsonNode readJson(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    private String taskPayload(String title, String description, String status, String priority, LocalDate dueDate) {
        return """
            {
              \"title\": \"%s\",
              \"description\": \"%s\",
              \"status\": \"%s\",
              \"priority\": \"%s\",
              \"dueDate\": \"%s\"
            }
            """.formatted(title, description, status, priority, dueDate);
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}