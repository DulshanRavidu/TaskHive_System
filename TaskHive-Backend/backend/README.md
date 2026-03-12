# TaskHive Backend

TaskHive Backend is a Spring Boot 4 REST API that provides authentication, role-based authorization, and task management for the TaskHive frontend. It uses Spring Security, Spring Data JPA, and a cookie-based opaque token session model.

## Tech Stack

- Java 17
- Spring Boot 4
- Spring Web MVC
- Spring Security
- Spring Data JPA
- MySQL
- H2 for tests
- Maven

## Features

- User registration and login
- Logout endpoint that clears the session cookie
- Role-aware access control for admin and regular users
- CRUD operations for tasks
- Task completion endpoint
- Pagination, filtering, and sorting for task listing
- Seeded demo users and sample tasks on first startup

## Project Structure

```text
src/main/java/com/taskhive/backend/
  auth/        Authentication and token handling
  config/      Security and seed data configuration
  task/        Task entities, services, controllers, repository
  user/        User entities, services, repositories

src/main/resources/
  application.properties

src/test/resources/
  application-test.properties
```

## Prerequisites

- Java 17+
- MySQL 8+
- Maven Wrapper (`mvnw.cmd` is included)

## Database Setup

Create the database before starting the application:

```sql
CREATE DATABASE taskhive;
```

Default local datasource configuration:

- Database URL: `jdbc:mysql://localhost:3306/taskhive?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true`
- Username: `root`
- Password: `root`

Override these with environment variables if your local setup differs.

## Configuration

The backend reads configuration from `src/main/resources/application.properties` and supports these environment variables:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_DRIVER`
- `CORS_ALLOWED_ORIGINS`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`
- `COOKIE_NAME`
- `COOKIE_MAX_AGE`
- `COOKIE_SECURE`

Example PowerShell session:

```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/taskhive?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="root"
$env:CORS_ALLOWED_ORIGINS="http://localhost:5173"
```

## Running Locally

Start the API with the Maven wrapper:

```powershell
.\mvnw.cmd spring-boot:run
```

The API runs at `http://localhost:8080` by default.

## API Overview

### Auth Endpoints

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`

### Task Endpoints

- `GET /api/tasks`
- `GET /api/tasks/{taskId}`
- `POST /api/tasks`
- `PUT /api/tasks/{taskId}`
- `DELETE /api/tasks/{taskId}`
- `PATCH /api/tasks/{taskId}/complete`

## Authentication Model

- Authentication is not JWT-based.
- The server issues a random opaque token and stores it in memory.
- That token is sent to the browser as an HTTP-only cookie.
- Each request is authenticated by resolving the cookie token back to a user.
- Tokens are revoked server-side on logout.

This means active sessions are lost when the server restarts, which is acceptable for local development and demos but not ideal for production-scale deployments.

## Seed Data

On first startup, the application seeds:

- Admin user: `admin@taskhive.local` / `admin123`
- Member user: `member@taskhive.local` / `member123`
- A small set of sample tasks for both users

The admin email and password can be overridden through `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`.

## Testing

Run the test suite with:

```powershell
.\mvnw.cmd test
```

Tests use an in-memory H2 database configured in `src/test/resources/application-test.properties`.

## Frontend Integration

- Expected frontend origin: `http://localhost:5173`
- Default frontend API target: `http://localhost:8080/api`
- Cookie name: `taskhive_session`
- Local development uses `SameSite=Lax`

## Notes

- `spring.jpa.hibernate.ddl-auto=update` is enabled for local development convenience.
- `COOKIE_SECURE=false` is appropriate for local HTTP development only.
- If Maven dependency downloads fail, verify internet access to Maven Central before troubleshooting the application itself.