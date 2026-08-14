"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task, TaskStatus } from "@/types/task";
import { TaskCardContent } from "./TaskCardContent";
import { TeamMember } from "./types";
import { User } from "@/types/auth";

interface SortableTaskCardProps {
  task: Task;
  onChangeStatus: (id: number, status: TaskStatus) => void;
  onDelete: (id: number) => void;
  onClickTask?: (task: Task) => void;
  teamMembers?: TeamMember[];
  currentUser?: User | null;
  canDrag?: (task: Task) => boolean;
  canEdit?: (task: Task) => boolean;
  canDelete?: (task: Task) => boolean;
}

export function SortableTaskCard({
  task,
  onChangeStatus,
  onDelete,
  onClickTask,
  teamMembers = [],
  currentUser,
  canDrag,
  canEdit,
  canDelete,
}: SortableTaskCardProps) {
  const isDragDisabled = canDrag ? !canDrag(task) : false;
  const isEditable = canEdit ? canEdit(task) : true;
  const isDeletable = canDelete ? canDelete(task) : true;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: isDragDisabled,
  });

  const style: React.CSSProperties = {
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
      className={`select-none touch-none rounded-xl transition-shadow ${
        isDragDisabled
          ? "cursor-pointer"
          : "cursor-grab active:cursor-grabbing hover:shadow-md"
      }`}
    >
      <TaskCardContent
        task={task}
        onChangeStatus={onChangeStatus}
        onDelete={onDelete}
        onClickTask={onClickTask}
        teamMembers={teamMembers}
        currentUser={currentUser}
        canDelete={isDeletable}
        canEdit={isEditable}
      />
    </div>
  );
}
