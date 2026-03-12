import type { Task, PaginatedResponse, TaskCreateRequest, AuthResponse, LoginRequest, RegisterRequest } from "@/types/task";

const DEMO_TASKS: Task[] = [
  {
    id: 1,
    title: "Design landing page mockup",
    description: "Create wireframes and high-fidelity mockups for the new landing page",
    status: "IN_PROGRESS",
    priority: "HIGH",
    dueDate: "2026-03-15",
    createdAt: "2026-03-01T10:00:00",
    updatedAt: "2026-03-05T14:30:00",
  },
  {
    id: 2,
    title: "Set up CI/CD pipeline",
    description: "Configure GitHub Actions for automated testing and deployment",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "2026-03-20",
    createdAt: "2026-03-02T09:00:00",
    updatedAt: "2026-03-02T09:00:00",
  },
  {
    id: 3,
    title: "Write API documentation",
    description: "Document all REST endpoints with request/response examples",
    status: "TODO",
    priority: "LOW",
    dueDate: "2026-03-25",
    createdAt: "2026-03-03T11:00:00",
    updatedAt: "2026-03-03T11:00:00",
  },
  {
    id: 4,
    title: "Implement user authentication",
    description: "Add JWT-based login and registration with role-based access control",
    status: "DONE",
    priority: "HIGH",
    dueDate: "2026-03-08",
    createdAt: "2026-02-25T08:00:00",
    updatedAt: "2026-03-07T16:00:00",
  },
  {
    id: 5,
    title: "Database schema review",
    description: "Review and optimize the current database schema for performance",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    dueDate: "2026-03-12",
    createdAt: "2026-03-04T13:00:00",
    updatedAt: "2026-03-09T10:00:00",
  },
  {
    id: 6,
    title: "Fix pagination bug",
    description: "The task list pagination shows incorrect page count when filters are active",
    status: "TODO",
    priority: "HIGH",
    dueDate: "2026-03-11",
    createdAt: "2026-03-08T15:00:00",
    updatedAt: "2026-03-08T15:00:00",
  },
  {
    id: 7,
    title: "Add unit tests for task service",
    description: "Write comprehensive unit tests covering all CRUD operations",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "2026-03-22",
    createdAt: "2026-03-06T10:00:00",
    updatedAt: "2026-03-06T10:00:00",
  },
  {
    id: 8,
    title: "Update project README",
    description: "Add setup instructions, environment variables, and architecture overview",
    status: "DONE",
    priority: "LOW",
    dueDate: "2026-03-05",
    createdAt: "2026-02-28T12:00:00",
    updatedAt: "2026-03-04T09:00:00",
  },
];

let tasks = [...DEMO_TASKS];
let nextId = 9;

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockAuthApi = {
  login: async (_data: LoginRequest): Promise<AuthResponse> => {
    await delay(500);
    return {
      token: "demo-jwt-token",
      user: { id: 1, username: "demo_user", email: _data.email, role: "ADMIN" },
    };
  },
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    await delay(500);
    return {
      token: "demo-jwt-token",
      user: { id: 1, username: data.username, email: data.email, role: "USER" },
    };
  },
};

export const mockTaskApi = {
  getAll: async (params: {
    page?: number;
    size?: number;
    status?: string;
    priority?: string;
    sortBy?: string;
    sortDir?: string;
  }): Promise<PaginatedResponse<Task>> => {
    await delay();
    let filtered = [...tasks];

    if (params.status && params.status !== "ALL") {
      filtered = filtered.filter((t) => t.status === params.status);
    }
    if (params.priority && params.priority !== "ALL") {
      filtered = filtered.filter((t) => t.priority === params.priority);
    }

    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    const sortBy = params.sortBy || "dueDate";
    const sortDir = params.sortDir || "asc";
    filtered.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "priority") {
        cmp = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === "dueDate") {
        cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === "createdAt") {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortDir === "desc" ? -cmp : cmp;
    });

    const page = params.page || 0;
    const size = params.size || 10;
    const start = page * size;
    const content = filtered.slice(start, start + size);

    return {
      content,
      totalPages: Math.ceil(filtered.length / size),
      totalElements: filtered.length,
      size,
      number: page,
    };
  },

  getById: async (id: number): Promise<Task> => {
    await delay();
    const task = tasks.find((t) => t.id === id);
    if (!task) throw new Error("Task not found");
    return task;
  },

  create: async (data: TaskCreateRequest): Promise<Task> => {
    await delay();
    const now = new Date().toISOString();
    const task: Task = { id: nextId++, ...data, createdAt: now, updatedAt: now };
    tasks.unshift(task);
    return task;
  },

  update: async (id: number, data: Partial<TaskCreateRequest>): Promise<Task> => {
    await delay();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error("Task not found");
    tasks[idx] = { ...tasks[idx], ...data, updatedAt: new Date().toISOString() };
    return tasks[idx];
  },

  delete: async (id: number): Promise<void> => {
    await delay();
    tasks = tasks.filter((t) => t.id !== id);
  },

  markComplete: async (id: number): Promise<Task> => {
    await delay();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error("Task not found");
    tasks[idx] = { ...tasks[idx], status: "DONE", updatedAt: new Date().toISOString() };
    return tasks[idx];
  },
};
