import { useState, useEffect, useCallback } from "react";
import { taskApi } from "@/services/api";
import type { Task, TaskCreateRequest, PaginatedResponse } from "@/types/task";
import { useAuth } from "@/contexts/AuthContext";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import TaskCard from "@/components/TaskCard";
import TaskFormDialog from "@/components/TaskFormDialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<PaginatedResponse<Task> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState("dueDate");
  const [sortDir, setSortDir] = useState("asc");
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === "object" && error !== null && "response" in error) {
      const response = (error as { response?: { data?: { message?: string } } }).response;
      return response?.data?.message || fallback;
    }
    return fallback;
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, size: 10, sortBy, sortDir };
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (priorityFilter !== "ALL") params.priority = priorityFilter;
      const data = await taskApi.getAll(params);
      setTasks(data);
    } catch (error) {
      toast({
        title: "Failed to load tasks",
        description: getErrorMessage(error, "Please try again."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, priorityFilter, sortBy, sortDir, toast]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleCreate = async (data: TaskCreateRequest) => {
    try {
      await taskApi.create(data);
      toast({ title: "Task created" });
      await fetchTasks();
    } catch (error) {
      toast({
        title: "Failed to create task",
        description: getErrorMessage(error, "Please try again."),
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUpdate = async (data: TaskCreateRequest) => {
    if (!editingTask) return;
    try {
      await taskApi.update(editingTask.id, data);
      toast({ title: "Task updated" });
      setEditingTask(null);
      await fetchTasks();
    } catch (error) {
      toast({
        title: "Failed to update task",
        description: getErrorMessage(error, "Please try again."),
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDelete = (id: number) => {
    setDeleteTaskId(id);
  };

  const confirmDelete = async () => {
    if (deleteTaskId === null) return;
    try {
      await taskApi.delete(deleteTaskId);
      toast({ title: "Task deleted" });
      setDeleteTaskId(null);
      if (tasks && tasks.content.length === 1 && page > 0) {
        setPage((currentPage) => currentPage - 1);
        return;
      }
      await fetchTasks();
    } catch (error) {
      toast({
        title: "Failed to delete task",
        description: getErrorMessage(error, "Please try again."),
        variant: "destructive",
      });
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await taskApi.markComplete(id);
      toast({ title: "Task marked as complete" });
      await fetchTasks();
    } catch (error) {
      toast({
        title: "Failed to update task",
        description: getErrorMessage(error, "Please try again."),
        variant: "destructive",
      });
    }
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const openCreate = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <main className="container py-8 flex-1">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">My Tasks</h2>
            <p className="text-sm text-muted-foreground">
              Welcome back, <span className="font-medium">{user?.username}</span>
              {tasks ? ` — ${tasks.totalElements} task${tasks.totalElements !== 1 ? "s" : ""}` : ""}
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            New Task
          </Button>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="TODO">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="DONE">Done</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priority</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
            </SelectContent>
          </Select>
          <Select value={`${sortBy}-${sortDir}`} onValueChange={(v) => { const [b, d] = v.split("-"); setSortBy(b); setSortDir(d); setPage(0); }}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate-asc">Due Date ↑</SelectItem>
              <SelectItem value="dueDate-desc">Due Date ↓</SelectItem>
              <SelectItem value="priority-asc">Priority ↑</SelectItem>
              <SelectItem value="priority-desc">Priority ↓</SelectItem>
              <SelectItem value="createdAt-desc">Newest First</SelectItem>
              <SelectItem value="createdAt-asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : tasks && tasks.content.length > 0 ? (
          <div className="space-y-3">
            {tasks.content.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={openEdit} onDelete={handleDelete} onComplete={handleComplete} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <ClipboardList className="mb-3 h-12 w-12 opacity-30" />
            <p className="text-lg font-medium">No tasks found</p>
            <p className="text-sm">Create a new task to get started</p>
          </div>
        )}

        {tasks && tasks.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">Page {page + 1} of {tasks.totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= tasks.totalPages - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>

      <TaskFormDialog
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingTask(null); }}
        onSubmit={editingTask ? handleUpdate : handleCreate}
        task={editingTask}
      />

      <AlertDialog open={deleteTaskId !== null} onOpenChange={(open) => { if (!open) setDeleteTaskId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AppFooter />
    </div>
  );
}
