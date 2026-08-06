"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task, TaskStatus } from "@/types/task";
import { TaskCardContent } from "./TaskCardContent";
import { TeamMember } from "./types";

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
  teamMembers,
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

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
      className="cursor-grab active:cursor-grabbing touch-none"
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
