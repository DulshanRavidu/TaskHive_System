# TaskHive Frontend

TaskHive Frontend is a React 18 + Vite + TypeScript application for managing tasks with separate user and admin experiences. It talks to the Spring Boot backend over HTTP using Axios and relies on an HTTP-only session cookie for authentication.

## Tech Stack

- React 18
- TypeScript
- Vite 5
- React Router
- Axios
- Tailwind CSS
- shadcn/ui + Radix UI
- Vitest

## Features

- Login and registration flows
- Role-based routing for user and admin dashboards
- Create, edit, delete, and complete tasks
- Filtering, sorting, and pagination for task lists
- Protected routes backed by server-issued session cookies
- Toast notifications and modern modal dialogs

## Project Structure

```text
src/
	components/    Shared UI and feature components
	contexts/      Authentication state and route gating
	hooks/         Reusable hooks
	pages/         Login, register, user dashboard, admin dashboard
	services/      Axios API client and request helpers
	test/          Frontend test setup
	types/         Shared TypeScript models
```

## Prerequisites

- Node.js 18+
- npm 9+ or a compatible package manager
- Running TaskHive backend API

## Getting Started

1. Install dependencies:

```powershell
npm install
```

2. Configure the backend API URL if needed:

```powershell
$env:VITE_API_URL="http://localhost:8080/api"
```

Or create a `.env` file:

```text
VITE_API_URL=http://localhost:8080/api
```

3. Start the development server:

```powershell
npm run dev
```

The app runs on the Vite dev server, typically at `http://localhost:5173`.

## Available Scripts

```powershell
npm run dev
npm run build
npm run build:dev
npm run preview
npm run lint
npm run test
npm run test:watch
```

## Authentication

- Authentication is cookie-based.
- The backend issues an HTTP-only cookie after login or registration.
- Axios is configured with `withCredentials: true` so the browser sends the session cookie automatically.
- Protected pages redirect unauthenticated users back to the login page.

## Demo Accounts

Seeded accounts provided by the backend:

- Admin: `admin@taskhive.local` / `admin123`
- Member: `member@taskhive.local` / `member123`

## Backend Integration

- Default API base URL: `http://localhost:8080/api`
- Auth endpoints: `/auth/login`, `/auth/register`, `/auth/logout`
- Task endpoints: `/tasks`, `/tasks/{id}`, `/tasks/{id}/complete`

## Build for Production

```powershell
npm run build
```

The production-ready files are generated in the `dist/` directory.

## Testing

Run the frontend test suite with:

```powershell
npm run test
```

## Notes

- If login fails unexpectedly, clear any stale browser-saved credentials and try again.
- Cross-origin local development depends on the backend allowing the frontend origin through CORS.
