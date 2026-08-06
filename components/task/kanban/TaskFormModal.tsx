"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Task,
  TaskStatus,
  Priority,
  Tag,
  WorkspaceStyle,
  CreateTaskDto,
} from "@/types/task";
import { TeamMember } from "./types";

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskDto) => void;
  initialData?: Task | null;
  defaultStatus?: TaskStatus;
  isTeamWorkspace: boolean;
  teamMembers?: TeamMember[];
  availableTags?: Tag[];
}

export function TaskFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultStatus = TaskStatus.PENDING,
  isTeamWorkspace,
  teamMembers = [],
  availableTags = [],
}: TaskFormModalProps) {
  const searchParams = useSearchParams();
  const searchParamStyle = searchParams.get("workspaceStyle") as WorkspaceStyle;

  const workspaceStyle =
    searchParamStyle ||
    (isTeamWorkspace ? WorkspaceStyle.TEAM : WorkspaceStyle.PERSONAL);

  const rawTeamId = searchParams.get("teamId");
  const teamIdFromUrl = rawTeamId ? Number(rawTeamId) : null;

  const rawCategoryId = searchParams.get("categoryId");
  const categoryIdFromUrl = rawCategoryId ? Number(rawCategoryId) : null;

  const todayStr = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState<CreateTaskDto>({
    title: "",
    description: "",
    priority: Priority.MEDIUM,
    status: defaultStatus,
    dueTo: "",
    reminder: 5,
    assignedTo: null,
    categoryId: isTeamWorkspace ? null : categoryIdFromUrl,
    tagIds: [],
    workspaceStyle: workspaceStyle,
    teamId: isTeamWorkspace ? teamIdFromUrl : null,
  });

  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  const minDateTime = getMinDateTime();
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      const extractedTagIds =
        initialData.taskTags?.map((item: any) =>
          item.tag ? Number(item.tag.id) : Number(item.id),
        ) || [];

      const parsedReminder = Number(initialData.reminder);
      const safeReminder = isNaN(parsedReminder) ? 5 : parsedReminder;

      const parsedAssignedTo =
        initialData.assignedTo !== null && initialData.assignedTo !== undefined
          ? Number(initialData.assignedTo)
          : null;

      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        priority: initialData.priority || Priority.MEDIUM,
        status: initialData.status || defaultStatus,
        reminder: Math.min(Math.max(safeReminder, 0), 120),
        dueTo: initialData.dueTo
          ? (() => {
              const date = new Date(initialData.dueTo);
              return `${date.getFullYear()}-${String(
                date.getMonth() + 1,
              ).padStart(
                2,
                "0",
              )}-${String(date.getDate()).padStart(2, "0")}T${String(
                date.getHours(),
              ).padStart(
                2,
                "0",
              )}:${String(date.getMinutes()).padStart(2, "0")}`;
            })()
          : "",
        assignedTo: parsedAssignedTo,
        categoryId: initialData.categoryId
          ? Number(initialData.categoryId)
          : isTeamWorkspace
            ? null
            : categoryIdFromUrl,
        tagIds: extractedTagIds,
        workspaceStyle: workspaceStyle,
        teamId: isTeamWorkspace
          ? initialData.teamId
            ? Number(initialData.teamId)
            : teamIdFromUrl
          : null,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        priority: Priority.MEDIUM,
        status: defaultStatus,
        dueTo: "",
        reminder: 5,
        assignedTo: null,
        categoryId: isTeamWorkspace ? null : categoryIdFromUrl,
        tagIds: [],
        workspaceStyle: workspaceStyle,
        teamId: isTeamWorkspace ? teamIdFromUrl : null,
      });
    }
  }, [
    initialData,
    defaultStatus,
    isOpen,
    workspaceStyle,
    teamIdFromUrl,
    categoryIdFromUrl,
    isTeamWorkspace,
  ]);

  if (!isOpen) return null;

  const toggleTag = (tagId: number) => {
    setFormData((prev) => {
      const currentTags = prev.tagIds || [];
      const exists = currentTags.includes(tagId);
      const nextTags = exists
        ? currentTags.filter((id) => id !== tagId)
        : [...currentTags, tagId];
      return { ...prev, tagIds: nextTags };
    });
  };

  const handleReminderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.valueAsNumber;
    const safeVal = isNaN(val) ? 0 : val;
    const clampedValue = Math.min(Math.max(safeVal, 0), 120);
    setFormData((prev) => ({ ...prev, reminder: clampedValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (formData.dueTo && formData.dueTo < todayStr) {
      return;
    }

    let finalAssignedTo: number | null = null;
    if (
      formData.assignedTo !== null &&
      formData.assignedTo !== undefined &&
      (formData.assignedTo as any) !== ""
    ) {
      finalAssignedTo = Number(formData.assignedTo);
    }

    if (isTeamWorkspace && !finalAssignedTo) {
      // alert("Vui lòng chọn người đảm nhận công việc!");
      return;
    }

    const payload: CreateTaskDto = {
      title: formData.title.trim(),
      description: formData.description?.trim() || undefined,
      priority: formData.priority,
      status: formData.status,
      reminder: Number(formData.reminder),
      workspaceStyle,
      teamId: isTeamWorkspace ? (formData.teamId ?? teamIdFromUrl) : null,
      categoryId:
        !isTeamWorkspace && formData.categoryId
          ? Number(formData.categoryId)
          : undefined,
      assignedTo: finalAssignedTo,
      dueTo: formData.dueTo ? new Date(formData.dueTo).toISOString() : "",
      tagIds: formData.tagIds || [],
    };

    console.log("Payload submit từ Modal:", payload);
    onSubmit(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h3 className="font-bold text-slate-800 text-lg">
            {initialData ? "Update task" : "Add new task"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-semibold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter task name..."
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter description..."
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: e.target.value as Priority,
                  }))
                }
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value={Priority.LOW}>LOW</option>
                <option value={Priority.MEDIUM}>MEDIUM</option>
                <option value={Priority.HIGH}>HIGH</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Status{" "}
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as TaskStatus,
                  }))
                }
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value={TaskStatus.PENDING}>PENDING</option>
                <option value={TaskStatus.IN_PROGRESS}>IN PROGRESS</option>
                <option value={TaskStatus.REVIEW}>REVIEW</option>
                <option value={TaskStatus.COMPLETED}>COMPLETED</option>
              </select>
            </div>
          </div>

          {isTeamWorkspace && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Assign to member <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.assignedTo ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    assignedTo: val !== "" ? Number(val) : null,
                  }));
                }}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">-- Select assignee --</option>
                {teamMembers.map((member) => (
                  <option key={member.user.id} value={member.user.id}>
                    {member.user.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Due Date<span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                min={minDateTime}
                value={formData.dueTo || ""}
                required
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dueTo: e.target.value }))
                }
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Reminder (minutes)<span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                max={120}
                value={formData.reminder}
                onChange={handleReminderChange}
                placeholder="0 - 120"
                required
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Maximum 120 minutes
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Add Tag (Tags)
            </label>
            {availableTags && availableTags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
                {availableTags.map((tag) => {
                  const isSelected = formData.tagIds?.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                        isSelected
                          ? "ring-2 ring-offset-1 ring-blue-500 shadow-sm opacity-100"
                          : "opacity-60 hover:opacity-100"
                      }`}
                      style={{
                        backgroundColor: `${tag.color || "#64748b"}25`,
                        color: tag.color || "#64748b",
                      }}
                    >
                      #{tag.name} {isSelected && "✓"}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Chưa có thẻ nào.</p>
            )}
          </div>

          <div className="pt-3 border-t flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {initialData ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
