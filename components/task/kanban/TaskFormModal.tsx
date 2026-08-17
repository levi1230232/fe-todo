"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isValid, parseISO } from "date-fns";

import {
  Task,
  TaskStatus,
  Priority,
  Tag,
  WorkspaceStyle,
  CreateTaskDto,
} from "@/types/task";
import { TeamMember } from "./types";
import { CreateTaskInput, createTaskSchema } from "@/schemas/task.schema";

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

  const teamIdFromUrl = searchParams.get("teamId")
    ? Number(searchParams.get("teamId"))
    : null;
  const categoryIdFromUrl = searchParams.get("categoryId")
    ? Number(searchParams.get("categoryId"))
    : null;

  const minDateTime = format(new Date(), "yyyy-MM-dd'T'HH:mm");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: Priority.MEDIUM,
      status: defaultStatus,
      dueTo: "",
      reminder: 5,
      assignedTo: undefined,
      categoryId: isTeamWorkspace ? null : categoryIdFromUrl,
      tagIds: [],
      workspaceStyle,
      teamId: isTeamWorkspace ? teamIdFromUrl : null,
    },
  });

  const selectedTagIds = watch("tagIds") || [];

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      const extractedTagIds =
        initialData.taskTags
          ?.map(({ tag }) => Number(tag.id))
          .filter((id) => !isNaN(id)) || [];

      const parsedReminder = Number(initialData.reminder);
      const safeReminder = isNaN(parsedReminder) ? 5 : parsedReminder;

      let formattedDueTo = "";
      if (initialData.dueTo) {
        const parsedDate = parseISO(initialData.dueTo);
        if (isValid(parsedDate)) {
          formattedDueTo = format(parsedDate, "yyyy-MM-dd'T'HH:mm");
        }
      }

      reset({
        title: initialData.title || "",
        description: initialData.description || "",
        priority: initialData.priority || Priority.MEDIUM,
        status: initialData.status || defaultStatus,
        reminder: Math.min(Math.max(safeReminder, 0), 120),
        dueTo: formattedDueTo,
        assignedTo: initialData.assignedTo
          ? Number(initialData.assignedTo)
          : undefined,
        categoryId: initialData.categoryId
          ? Number(initialData.categoryId)
          : isTeamWorkspace
            ? null
            : categoryIdFromUrl,
        tagIds: extractedTagIds,
        workspaceStyle,
        teamId: isTeamWorkspace
          ? initialData.teamId
            ? Number(initialData.teamId)
            : teamIdFromUrl
          : null,
      });
    } else {
      reset({
        title: "",
        description: "",
        priority: Priority.MEDIUM,
        status: defaultStatus,
        dueTo: "",
        reminder: 5,
        assignedTo: undefined,
        categoryId: isTeamWorkspace ? null : categoryIdFromUrl,
        tagIds: [],
        workspaceStyle,
        teamId: isTeamWorkspace ? teamIdFromUrl : null,
      });
    }
  }, [
    isOpen,
    initialData,
    defaultStatus,
    workspaceStyle,
    teamIdFromUrl,
    categoryIdFromUrl,
    isTeamWorkspace,
    reset,
  ]);

  if (!isOpen) return null;

  const toggleTag = (rawTagId: number | string) => {
    const tagId = Number(rawTagId);
    const currentTags = selectedTagIds.map(Number).filter((id) => !isNaN(id));

    const nextTags = currentTags.includes(tagId)
      ? currentTags.filter((id) => id !== tagId)
      : [...currentTags, tagId];

    setValue("tagIds", nextTags, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const onFormSubmit = (data: CreateTaskInput) => {
    const cleanTagIds = (data.tagIds ?? [])
      .map(Number)
      .filter((id) => !isNaN(id));

    const payload: CreateTaskDto = {
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
      priority: data.priority,
      status: data.status,
      reminder: Number(data.reminder),
      workspaceStyle: data.workspaceStyle,
      teamId: isTeamWorkspace ? (data.teamId ?? teamIdFromUrl) : null,
      categoryId:
        !isTeamWorkspace && data.categoryId
          ? Number(data.categoryId)
          : undefined,
      assignedTo: data.assignedTo ? Number(data.assignedTo) : null,
      dueTo: data.dueTo ? new Date(data.dueTo).toISOString() : "",
      tagIds: cleanTagIds,
    };

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

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("title")}
              placeholder="Enter task name..."
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              {...register("description")}
              placeholder="Enter description..."
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Priority
              </label>
              <select
                {...register("priority")}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value={Priority.LOW}>LOW</option>
                <option value={Priority.MEDIUM}>MEDIUM</option>
                <option value={Priority.HIGH}>HIGH</option>
              </select>
              {errors.priority && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.priority.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Status
              </label>
              <select
                {...register("status")}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value={TaskStatus.PENDING}>PENDING</option>
                <option value={TaskStatus.IN_PROGRESS}>IN PROGRESS</option>
                <option value={TaskStatus.REVIEW}>REVIEW</option>
                <option value={TaskStatus.COMPLETED}>COMPLETED</option>
              </select>
              {errors.status && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.status.message}
                </p>
              )}
            </div>
          </div>

          {isTeamWorkspace && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Assign to member <span className="text-red-500">*</span>
              </label>
              <select
                {...register("assignedTo", {
                  setValueAs: (v) =>
                    v === "" || v === null ? null : Number(v),
                })}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">-- Select assignee --</option>
                {teamMembers.map((member) => (
                  <option key={member.user.id} value={member.user.id}>
                    {member.user.name}
                  </option>
                ))}
              </select>
              {errors.assignedTo && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.assignedTo.message}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                min={minDateTime}
                {...register("dueTo")}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {errors.dueTo && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.dueTo.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Reminder (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                max={120}
                {...register("reminder", {
                  setValueAs: (v) => Math.min(Math.max(Number(v) || 0, 0), 120),
                })}
                placeholder="0 - 120"
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Maximum 120 minutes
              </span>
              {errors.reminder && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.reminder.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Add Tag (Tags)
            </label>
            {availableTags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
                {availableTags.map((tag) => {
                  const tagIdNum = Number(tag.id);
                  const isSelected = selectedTagIds
                    .map(Number)
                    .includes(tagIdNum);

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
              <p className="text-xs text-slate-400 italic">
                No tags available.
              </p>
            )}
            {errors.tagIds && (
              <p className="text-xs text-red-500 mt-1">
                {errors.tagIds.message as string}
              </p>
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
