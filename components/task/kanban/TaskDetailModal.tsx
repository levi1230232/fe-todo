"use client";

import React, { useState, useEffect } from "react";
import { Task, Priority } from "@/types/task";
import { TeamMember } from "./types";
import { useRemoveTag } from "@/hooks/useTask";
import { useUser } from "@/hooks/useAuth";
import { TaskCommentSection } from "./TaskCommentSection";

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  teamMembers?: TeamMember[];
}

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  teamMembers = [],
}: TaskDetailModalProps) {
  const { data: user } = useUser();
  const { mutate: removeTag } = useRemoveTag();

  const [localTaskTags, setLocalTaskTags] = useState(task?.taskTags || []);

  useEffect(() => {
    if (task) {
      setLocalTaskTags(task.taskTags || []);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const loggedInMember = user?.id
    ? teamMembers.find((m) => m.user?.id === user.id || m.id === user.id)
    : null;

  const activeRole = loggedInMember?.role;

  const canModify =
    task.workspaceStyle === "PERSONAL" ||
    (task.workspaceStyle === "TEAM" &&
      (activeRole === "OWNER" || activeRole === "ADMIN"));

  const assigneeId =
    typeof task.assignedTo === "object" && task.assignedTo !== null
      ? (task.assignedTo as { id: number | string }).id
      : task.assignedTo;

  const assignedMember = teamMembers.find(
    (m) =>
      String(m.user?.id) === String(assigneeId) ||
      String(m.id) === String(assigneeId),
  );

  const handleRemoveTag = (tagId: number) => {
    if (!task.id) return;

    setLocalTaskTags((prev) =>
      prev.filter((item) => {
        const currentTagId = item.tag?.id || (item as any).id;
        return String(currentTagId) !== String(tagId);
      }),
    );

    removeTag({ taskId: task.id, tagId });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between gap-4 border-b pb-3 shrink-0">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded ${
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

          <div className="flex items-center gap-2">
            {canModify && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onEdit(task);
                  }}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-md transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(task.id);
                    onClose();
                  }}
                  className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-medium px-3 py-1.5 rounded-md transition-colors"
                >
                  Delete
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="space-y-4 overflow-y-auto pr-1 flex-1 no-scrollbar px-2">
          <h2 className="text-xl font-bold text-slate-800">{task.title}</h2>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <div>
              📅 Due Date:{" "}
              <span className="font-semibold text-slate-800">
                {task.dueTo
                  ? new Date(task.dueTo).toLocaleDateString("vi-VN")
                  : "No set"}
              </span>
            </div>
            <div>
              👤 Assignee:{" "}
              <span className="font-semibold text-slate-800">
                {assignedMember
                  ? assignedMember.user?.name ||
                    assignedMember.user?.email ||
                    `User #${assignedMember.user?.id || assignedMember.id}`
                  : task.assignee
                    ? task.assignee.name
                    : "Unassigned"}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Description
            </h4>
            <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 min-h-[70px] whitespace-pre-wrap border border-slate-100">
              {task.description || "No description available"}
            </div>
          </div>

          {localTaskTags && localTaskTags.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {localTaskTags.map((item, index) => {
                  const tag = item.tag || item;
                  if (!tag || !tag.id) return null;
                  return (
                    <span
                      key={tag.id || index}
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium group transition-all"
                      style={{
                        backgroundColor: `${tag.color || "#64748b"}20`,
                        color: tag.color || "#64748b",
                      }}
                    >
                      #{tag.name}
                      {canModify && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag.id)}
                          className="opacity-60 hover:opacity-100 hover:bg-black/10 rounded-full w-4 h-4 inline-flex items-center justify-center transition-all text-[10px]"
                          title="Remove tag"
                        >
                          ✕
                        </button>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <TaskCommentSection taskId={task.id} currentUserId={user?.id} />
        </div>

        <div className="pt-3 border-t flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
