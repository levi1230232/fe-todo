"use client";

import { CheckCircle2 } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Task } from "@/types/task";
import { useSearchParams } from "next/navigation";

interface TaskListProps {
  tasks: Task[] | undefined;
  isLoading: boolean;
  emptyText: string;
  isOverdue?: boolean;
}

export default function TaskList({
  tasks,
  isLoading,
  emptyText,
  isOverdue = false,
}: TaskListProps) {
  const searchParams = useSearchParams();
  const activeTaskId = searchParams.get("activeTaskId");

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center bg-white">
        <p className="text-slate-500 text-sm">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const isActive = activeTaskId === String(task.id);

        const targetHref = task.categoryId
          ? `tasks?workspaceStyle=${task.workspaceStyle}&categoryId=${task.categoryId}&activeTaskId=${task.id}`
          : `tasks?workspaceStyle=${task.workspaceStyle}&teamId=${task.teamId}&activeTaskId=${task.id}`;

        return (
          <Link
            href={targetHref}
            key={task.id}
            className={`flex items-center justify-between p-4 rounded-lg border bg-white transition-all duration-200 ease-in-out transform active:scale-95 ${
              isActive
                ? "scale-105 border-indigo-500 shadow-lg ring-2 ring-indigo-500/20 bg-indigo-50/20 z-10"
                : isOverdue
                  ? "border-rose-200 bg-rose-50/30 hover:shadow-md hover:-translate-y-0.5"
                  : "border-slate-200 hover:shadow-md hover:-translate-y-0.5"
            }`}
          >
            <div className="flex items-center gap-3">
              <CheckCircle2
                className={`h-5 w-5 ${
                  task.status === "COMPLETED"
                    ? "text-emerald-500"
                    : "text-slate-300"
                }`}
              />
              <div>
                <p
                  className={`font-medium text-sm ${
                    task.status === "COMPLETED"
                      ? "line-through text-slate-400"
                      : "text-slate-800"
                  }`}
                >
                  {task.title}
                </p>
                {task.dueTo && (
                  <p className="text-xs text-slate-400">
                    Due to: {new Date(task.dueTo).toLocaleDateString("vi-VN")}
                  </p>
                )}
              </div>
            </div>
            {task.priority && (
              <Badge
                variant={task.priority === "HIGH" ? "destructive" : "secondary"}
              >
                {task.priority}
              </Badge>
            )}
          </Link>
        );
      })}
    </div>
  );
}
