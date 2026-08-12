"use client";

import { useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task, TaskStatus } from "@/types/task";
import { TaskCardContent } from "./TaskCardContent";
import { TeamMember } from "./types";
import { useUser } from "@/hooks/useAuth";

interface SortableTaskCardProps {
  task: Task;
  onChangeStatus: (id: number, status: TaskStatus) => void;
  onDelete: (id: number) => void;
  onClickTask?: (task: Task) => void;
  teamMembers?: TeamMember[];
}

export function SortableTaskCard({
  task,
  onChangeStatus,
  onDelete,
  onClickTask,
  teamMembers = [],
}: SortableTaskCardProps) {
  const { data: user } = useUser();

  const canDrag = useMemo(() => {
    if (!user) return false;

    if (task.workspaceStyle === "PERSONAL" || teamMembers.length === 0) {
      return true;
    }

    const currentMember = teamMembers.find(
      (m) => String(m.user?.id ?? m.id) === String(user.id),
    );
    const role = currentMember?.role?.toUpperCase();

    if (role === "ADMIN" || role === "OWNER") {
      return true;
    }

    if (task.assignedTo && String(task.assignedTo) === String(user.id)) {
      return true;
    }

    if (task.createBy && String(task.createBy) === String(user.id)) {
      return true;
    }

    return false;
  }, [user, task, teamMembers]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: !canDrag,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${
        canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
      } touch-none`}
    >
      <TaskCardContent
        task={task}
        onChangeStatus={onChangeStatus}
        onDelete={onDelete}
        onClickTask={onClickTask}
        teamMembers={teamMembers}
      />
    </div>
  );
}
