import axios from "axios";
import type {
  User,
  LoginRequest,
  RegisterRequest,
  Task,
  TaskCreateRequest,
  PaginatedResponse,
  TaskStatus,
  TaskPriority,
} from "@/types/task";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";
    console.error(`[API] ${status ?? "Network"} error on ${url}:`, error.response?.data ?? error.message);

    // Redirect to login when the session is invalid/expired.
    // 401 = unauthenticated (expected after our AuthenticationEntryPoint fix).
    // 403 = Spring Security default for unauthenticated requests (before that fix, or edge cases).
    if ((status === 401 || status === 403) && !url.includes("/auth/")) {
      console.warn("[API] Session invalid — clearing user and redirecting to /login");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (data: LoginRequest) =>
    api.post<User>("/auth/login", data).then((r) => r.data),
  register: (data: RegisterRequest) =>
    api.post<User>("/auth/register", data).then((r) => r.data),
  logout: () =>
    api.post("/auth/logout").then(() => undefined),
};

// Tasks
export const taskApi = {
  getAll: (params: {
    page?: number;
    size?: number;
    status?: TaskStatus;
    priority?: TaskPriority;
    sortBy?: string;
    sortDir?: string;
  }) =>
    api
      .get<PaginatedResponse<Task>>("/tasks", { params })
      .then((r) => r.data),

  getById: (id: number) =>
    api.get<Task>(`/tasks/${id}`).then((r) => r.data),

  create: (data: TaskCreateRequest) =>
    api.post<Task>("/tasks", data).then((r) => r.data),

  update: (id: number, data: Partial<TaskCreateRequest>) =>
    api.put<Task>(`/tasks/${id}`, data).then((r) => r.data),

  delete: (id: number) => api.delete(`/tasks/${id}`),

  markComplete: (id: number) =>
    api.patch<Task>(`/tasks/${id}/complete`).then((r) => r.data),
};

export default api;
