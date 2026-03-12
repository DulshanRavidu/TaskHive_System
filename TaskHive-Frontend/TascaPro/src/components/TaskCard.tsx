import type { Task } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Edit, Trash2, Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";

const statusConfig: Record<string, { label: string; className: string }> = {
  TODO: { label: "To Do", className: "bg-secondary text-secondary-foreground" },
  IN_PROGRESS: { label: "In Progress", className: "bg-primary/10 text-primary" },
  DONE: { label: "Done", className: "bg-success/10 text-success" },
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  LOW: { label: "Low", className: "bg-muted text-muted-foreground" },
  MEDIUM: { label: "Medium", className: "bg-warning/10 text-warning" },
  HIGH: { label: "High", className: "bg-destructive/10 text-destructive" },
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onComplete: (id: number) => void;
  ownerUsername?: string;
}

export default function TaskCard({ task, onEdit, onDelete, onComplete, ownerUsername }: TaskCardProps) {
  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "DONE";

  return (
    <Card className={`transition-all hover:shadow-md ${task.status === "DONE" ? "opacity-70" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className={`font-medium text-card-foreground ${task.status === "DONE" ? "line-through" : ""}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{task.description}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={status.className}>{status.label}</Badge>
              <Badge variant="outline" className={priority.className}>{priority.label}</Badge>
              <span className={`flex items-center gap-1 text-xs ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                <Calendar className="h-3 w-3" />
                {format(new Date(task.dueDate), "MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {format(new Date(task.createdAt), "MMM d")}
              </span>
              {ownerUsername && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  {ownerUsername}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            {task.status !== "DONE" && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-success" onClick={() => onComplete(task.id)} title="Mark complete">
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(task)} title="Edit">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(task.id)} title="Delete">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
