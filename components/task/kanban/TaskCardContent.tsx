"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Task, TaskStatus, Priority } from "@/types/task";
import { Calendar, Trash2, UserCheck, Check, X, User } from "lucide-react";
import { TeamMember } from "./types";
import { useSearchParams } from "next/navigation";
import { useChangeTaskDeadline, useAssignTask } from "@/hooks/useTask";
import { User as IUser } from "@/types/auth";
import { format, isValid } from "date-fns";
import { vi } from "date-fns/locale";

export interface TaskCardContentProps {
  task: Task & {
    commentCount?: number;
    assigneeId?: number;
    createdById?: number;
  };
  onChangeStatus?: (id: number, status: TaskStatus) => void;
  onDelete?: (id: number) => void;
  onClickTask?: (task: Task) => void;
  isOverlay?: boolean;
  teamMembers?: TeamMember[];
  currentUser?: IUser | null;
  canDelete?: boolean;
  canEdit?: boolean;
}

export function TaskCardContent({
  task,
  onDelete,
  onClickTask,
  teamMembers = [],
  currentUser,
  isOverlay = false,
  canDelete = false,
  canEdit = false,
}: TaskCardContentProps) {
  const searchParams = useSearchParams();
  const activeTaskId = searchParams.get("activeTaskId");

  const [isEditingDate, setIsEditingDate] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [dueDateInput, setDueDateInput] = useState<string>("");

  const changeDeadlineMutation = useChangeTaskDeadline();
  const assignTaskMutation = useAssignTask();

  useEffect(() => {
    if (task.dueTo) {
      const d = new Date(task.dueTo);
      if (isValid(d)) {
        setDueDateInput(format(d, "yyyy-MM-dd'T'HH:mm"));
      }
    } else {
      setDueDateInput("");
    }
  }, [task.dueTo]);

  const handleSaveDeadline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueDateInput) return;

    changeDeadlineMutation.mutate(
      { id: task.id, dueTo: new Date(dueDateInput).toISOString() },
      {
        onSuccess: () => {
          setIsEditingDate(false);
        },
      },
    );
  };

  const handleAssignUser = (newAssigneeId: number) => {
    if (newAssigneeId === task.assignedTo) {
      setIsAssigning(false);
      return;
    }

    assignTaskMutation.mutate(
      { id: task.id, assignedTo: newAssigneeId },
      {
        onSuccess: () => {
          setIsAssigning(false);
        },
      },
    );
  };

  const isActive = activeTaskId === String(task.id);

  const creatorId = (task as any).createdBy ?? task.createdById;
  const isMyTask =
    !!currentUser?.id &&
    (task.assignedTo === currentUser.id || creatorId === currentUser.id);

  const assignee = task.assignedTo
    ? teamMembers.find((m) => (m.user?.id ?? m.id) === task.assignedTo)
    : null;

  const formattedDueDate = (() => {
    if (!task.dueTo) return null;
    const d = new Date(task.dueTo);
    return isValid(d) ? format(d, "HH:mm dd/MM/yyyy", { locale: vi }) : null;
  })();

  const handleClick = () => {
    if (isEditingDate || isAssigning) return;
    onClickTask?.(task);
  };

  return (
    <motion.div
      layoutId={`task-card-${task.id}`}
      onClick={handleClick}
      animate={isActive ? { scale: 1.03, zIndex: 20 } : { scale: 1, zIndex: 0 }}
      whileHover={{ scale: isOverlay ? 1.05 : 1.015 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className={`p-3.5 rounded-xl border shadow-sm transition-all flex flex-col justify-between gap-3 group select-none cursor-pointer relative ${
        isMyTask
          ? "bg-white border-indigo-300 hover:border-indigo-400 hover:shadow-indigo-100/50 hover:shadow-md"
          : "bg-indigo-50/40 border-slate-200 hover:shadow-md"
      } ${
        isOverlay
          ? "shadow-2xl border-blue-500 rotate-2 cursor-grabbing scale-105 bg-white"
          : ""
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                task.priority === Priority.HIGH
                  ? "bg-red-100 text-red-700"
                  : task.priority === Priority.MEDIUM
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-600"
              }`}
            >
              {task.priority === Priority.HIGH
                ? "High"
                : task.priority === Priority.MEDIUM
                  ? "Medium"
                  : "Low"}
            </span>
            {isMyTask && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                <UserCheck className="w-3 h-3" />
                My Tasks
              </span>
            )}
          </div>

          {canDelete && onDelete && (
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors p-1 rounded-md opacity-0 group-hover:opacity-100"
              title="Move to trash"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 leading-snug">
            {task.title}
          </h3>

          {task.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

        {task.taskTags && task.taskTags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {task.taskTags.map(({ tag }) => (
              <span
                key={tag.id}
                className="text-[10px] px-2 py-0.5 rounded-md font-medium"
                style={{
                  backgroundColor: `${tag.color}15`,
                  color: tag.color,
                }}
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div
        className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs text-slate-500 min-h-[36px] w-full"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {task.workspaceStyle === "TEAM" && (
          <div className="shrink-0">
            {isAssigning && canEdit ? (
              <div className="flex items-center gap-1">
                <select
                  defaultValue={task.assignedTo || ""}
                  onChange={(e) => handleAssignUser(Number(e.target.value))}
                  disabled={assignTaskMutation.isPending}
                  className="text-[11px] p-1 border rounded bg-white text-slate-700 outline-none focus:border-indigo-500 max-w-[100px]"
                >
                  <option value="" disabled>
                    Select...
                  </option>
                  {teamMembers.map((m) => {
                    const uId = m.user?.id ?? m.id;
                    const uName = m.user?.name ?? "Thành viên";
                    return (
                      <option key={uId} value={uId}>
                        {uName}
                      </option>
                    );
                  })}
                </select>
                <button
                  type="button"
                  onClick={() => setIsAssigning(false)}
                  className="p-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => {
                  if (canEdit) {
                    setIsEditingDate(false);
                    setIsAssigning(true);
                  }
                }}
                className={`flex items-center gap-1.5 p-1 rounded-md transition-colors ${
                  canEdit
                    ? "cursor-pointer hover:bg-slate-100"
                    : "cursor-default"
                }`}
                title={canEdit ? "Change assignee" : undefined}
              >
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
                  {assignee?.user?.name ? (
                    assignee.user.name.charAt(0).toUpperCase()
                  ) : (
                    <User className="w-3 h-3 text-indigo-600" />
                  )}
                </div>
                <span className="text-[11px] truncate max-w-[70px]">
                  {assignee?.user?.name ?? "Unassign"}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 flex justify-end min-w-0">
          {isEditingDate && canEdit ? (
            <form
              onSubmit={handleSaveDeadline}
              className="flex items-center gap-1 min-w-0 w-full justify-end"
            >
              <input
                type="datetime-local"
                min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                value={dueDateInput}
                onChange={(e) => setDueDateInput(e.target.value)}
                className="text-[10px] px-1 py-0.5 border rounded bg-white text-slate-700 outline-none focus:border-indigo-500 w-full max-w-[130px] min-w-0"
              />
              <button
                type="submit"
                disabled={changeDeadlineMutation.isPending}
                className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 shrink-0"
                title="Save"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditingDate(false)}
                className="p-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300 shrink-0"
                title="Cancel"
              >
                <X className="w-3 h-3" />
              </button>
            </form>
          ) : (
            <div
              onClick={() => {
                if (canEdit) {
                  setIsAssigning(false);
                  setIsEditingDate(true);
                }
              }}
              className={`flex items-center gap-1 text-[11px] text-slate-400 px-1.5 py-1 rounded transition-colors group/date truncate ${
                canEdit
                  ? "cursor-pointer hover:text-indigo-600 hover:bg-indigo-50/60"
                  : "cursor-default"
              }`}
              title={canEdit ? "Click to edit deadline" : undefined}
            >
              <Calendar className="w-3.5 h-3.5 group-hover/date:text-indigo-600 shrink-0" />
              <span className="truncate">
                {formattedDueDate || "Add deadline"}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
