"use client";

import { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Task, TaskStatus } from "@/types/task";
import { SortableTaskCard } from "./SortableTaskCard";
import { TeamMember } from "./types";
import { User } from "@/types/auth";

interface KanbanColumnProps {
  column: {
    id: TaskStatus;
    title: string;
    color: string;
    badgeColor: string;
  };
  tasks: Task[];
  onChangeStatus: (id: number, status: TaskStatus) => void;
  onClickTask: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
  onDelete: (id: number) => void;
  teamMembers?: TeamMember[];
  currentUser?: User | null;
  canDrag?: (task: Task) => boolean;
  canEdit?: (task: Task) => boolean;
  canDelete?: (task: Task) => boolean;
  canCreate?: boolean;
}

export function KanbanColumn({
  column,
  tasks,
  onChangeStatus,
  onDelete,
  onClickTask,
  onAddTask,
  teamMembers = [],
  currentUser,
  canDrag,
  canEdit,
  canDelete,
  canCreate,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl border-2 p-3.5 min-h-[550px] transition-all duration-200 ${
        column.color
      } ${
        isOver
          ? "ring-2 ring-blue-400/50 border-blue-400 bg-white/40 dark:bg-slate-900/40"
          : ""
      } h-full`}
    >
      <div className="flex shrink-0 items-center justify-between mb-3 px-1">
        <h2 className="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2">
          <span>{column.title}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-semibold shadow-sm ${column.badgeColor}`}
          >
            {tasks.length}
          </span>
        </h2>

        {canCreate && (
          <button
            onClick={() => onAddTask(column.id)}
            title="Add task to this column"
            className="p-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-white/80 transition-colors"
          >
            <span className="text-lg font-bold leading-none">+</span>
          </button>
        )}
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-3">
          {tasks.length === 0 ? (
            <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200/80 dark:border-slate-700/80 rounded-lg text-xs text-slate-400 font-medium">
              No tasks available
            </div>
          ) : (
            tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onChangeStatus={onChangeStatus}
                onDelete={onDelete}
                onClickTask={onClickTask}
                teamMembers={teamMembers}
                currentUser={currentUser}
                canDrag={canDrag}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            ))
          )}
        </div>
      </SortableContext>

      {canCreate && (
        <button
          onClick={() => onAddTask(column.id)}
          className="mt-3 w-full py-2 px-3 border border-dashed border-slate-300 hover:border-blue-500 text-slate-500 hover:text-blue-600 hover:bg-white/60 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>+</span> Add task
        </button>
      )}
    </div>
  );
}
