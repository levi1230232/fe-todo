"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task, TaskStatus } from "@/types/task";
import { TaskCardContent } from "./TaskCardContent";
import { User } from "@/types/auth";
import { TeamMember } from "@/types/team";

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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative select-none touch-none rounded-xl transition-all duration-200 ${
        isDragDisabled
          ? "cursor-pointer"
          : "cursor-grab active:cursor-grabbing hover:shadow-md"
      } ${
        isDragging
          ? "border-2 border-dashed border-slate-300/80 bg-slate-100/50 dark:bg-slate-800/40 rounded-xl"
          : ""
      }`}
    >
      <div
        className={
          isDragging
            ? "invisible opacity-0 pointer-events-none"
            : "opacity-100 transition-opacity"
        }
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
    </div>
  );
}
