"use client";

import React, { useMemo, useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";

import {
  useMyTasks,
  useTeamTasks,
  useTasksByCategory,
  useChangeTaskStatus,
  useSoftDeleteTask,
  useCreateTask,
  useUpdateTask,
  useAddTags,
  useAssignTask,
} from "@/hooks/useTask";
import { useTeamMembers } from "@/hooks/useTeam";
import { useGetPersonalTags, useGetTeamTags } from "@/hooks/useTag";

import {
  Task,
  TaskStatus,
  WorkspaceStyle,
  Tag,
  CreateTaskDto,
} from "@/types/task";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCardContent } from "./TaskCardContent";
import { TaskFormModal } from "./TaskFormModal";
import { TaskDetailModal } from "./TaskDetailModal";
import { COLUMNS, KanbanBoardProps, TeamMember } from "./types";

export default function KanbanBoard({
  teamId = null,
  filters,
}: KanbanBoardProps) {
  const searchParams = useSearchParams();
  const categoryIdParam = searchParams.get("categoryId");
  const categoryId = categoryIdParam ? Number(categoryIdParam) : null;

  const isTeamWorkspace = Boolean(teamId && teamId > 0);

  const myTasksQuery = useMyTasks();
  const teamTasksQuery = useTeamTasks(teamId ?? 0);
  const categoryTasksQuery = useTasksByCategory(categoryId ?? 0);

  const personalTagsQuery = useGetPersonalTags();
  const teamTagsQuery = useGetTeamTags(teamId ?? 0);

  const availableTags: Tag[] = isTeamWorkspace
    ? teamTagsQuery.data || []
    : personalTagsQuery.data || [];

  const teamMembersQuery = useTeamMembers?.(teamId ?? 0);
  const teamMembers: TeamMember[] = isTeamWorkspace
    ? teamMembersQuery?.data || []
    : [];

  const activeQuery = categoryId
    ? categoryTasksQuery
    : isTeamWorkspace
      ? teamTasksQuery
      : myTasksQuery;

  const { data: rawData, isLoading, isError, error } = activeQuery;

  const rawTasks: Task[] = useMemo(() => {
    if (Array.isArray(rawData)) return rawData;
    if (rawData && Array.isArray((rawData as any).tasks)) {
      return (rawData as any).tasks;
    }
    return [];
  }, [rawData]);

  const changeStatusMutation = useChangeTaskStatus();
  const softDeleteMutation = useSoftDeleteTask();
  const createTaskMutation = useCreateTask?.();
  const updateTaskMutation = useUpdateTask?.();
  const addTagsMutation = useAddTags();
  const assignTaskMutation = useAssignTask();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [defaultColumnStatus, setDefaultColumnStatus] = useState<TaskStatus>(
    TaskStatus.PENDING,
  );

  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const initialTaskStatusRef = useRef<TaskStatus | null>(null);

  useEffect(() => {
    if (Array.isArray(rawTasks)) {
      setLocalTasks(rawTasks);
    }
  }, [rawTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const filteredTasks = useMemo(() => {
    return localTasks.filter((task) => {
      if (
        filters?.search &&
        !task.title.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      if (
        filters?.priority &&
        filters.priority !== "all" &&
        task.priority !== filters.priority
      ) {
        return false;
      }

      if (isTeamWorkspace && filters?.assignee && filters.assignee !== "all") {
        if (filters.assignee === "unassigned" && task.assignedTo !== null)
          return false;
        if (
          filters.assignee !== "unassigned" &&
          String(task.assignedTo) !== filters.assignee
        )
          return false;
      }

      if (filters?.tag && filters.tag !== "all") {
        const hasTag = task.taskTags?.some(
          ({ tag }) => tag.name.toLowerCase() === filters.tag?.toLowerCase(),
        );
        if (!hasTag) return false;
      }

      if (filters?.dueDateType && filters.dueDateType !== "all" && task.dueTo) {
        const taskDate = new Date(task.dueTo);
        const now = new Date();

        if (filters.dueDateType === "today") {
          if (taskDate.toDateString() !== now.toDateString()) return false;
        } else if (filters.dueDateType === "this_week") {
          const startOfWeek = new Date(now);
          const day = startOfWeek.getDay();
          const diff = day === 0 ? -6 : 1 - day;

          startOfWeek.setDate(startOfWeek.getDate() + diff);
          startOfWeek.setHours(0, 0, 0, 0);

          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(endOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);

          if (taskDate < startOfWeek || taskDate > endOfWeek) return false;
        } else if (filters.dueDateType === "overdue") {
          if (taskDate >= now || task.status === TaskStatus.COMPLETED)
            return false;
        } else if (
          filters.dueDateType === "custom" &&
          filters.startDate &&
          filters.endDate
        ) {
          const start = new Date(filters.startDate);
          const end = new Date(filters.endDate);

          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);

          if (taskDate < start || taskDate > end) return false;
        }
      }

      return true;
    });
  }, [localTasks, filters, isTeamWorkspace]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = localTasks.find((t) => t.id === Number(active.id));
    if (task) {
      setActiveTask(task);
      initialTaskStatusRef.current = task.status;
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = Number(active.id);
    const overId = over.id;

    const activeTaskIndex = localTasks.findIndex((t) => t.id === activeId);
    if (activeTaskIndex === -1) return;

    let newStatus: TaskStatus | null = null;

    if (Object.values(TaskStatus).includes(overId as TaskStatus)) {
      newStatus = overId as TaskStatus;
    } else {
      const overTask = localTasks.find((t) => t.id === Number(overId));
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    if (newStatus && localTasks[activeTaskIndex].status !== newStatus) {
      setLocalTasks((prev) => {
        const updated = [...prev];
        updated[activeTaskIndex] = {
          ...updated[activeTaskIndex],
          status: newStatus,
        };
        return updated;
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    const originalStatus = initialTaskStatusRef.current;
    initialTaskStatusRef.current = null;

    if (!over) {
      if (rawTasks) setLocalTasks(rawTasks);
      return;
    }

    const taskId = Number(active.id);
    const overId = over.id;

    let targetStatus: TaskStatus | null = null;

    if (Object.values(TaskStatus).includes(overId as TaskStatus)) {
      targetStatus = overId as TaskStatus;
    } else {
      const overTask = rawTasks?.find((t) => t.id === Number(overId));
      if (overTask) {
        targetStatus = overTask.status;
      } else {
        const localOverTask = localTasks.find((t) => t.id === Number(overId));
        if (localOverTask) targetStatus = localOverTask.status;
      }
    }

    if (targetStatus && originalStatus && originalStatus !== targetStatus) {
      changeStatusMutation.mutate(
        { id: taskId, status: targetStatus },
        {
          onError: (err) => {
            console.error("Cập nhật trạng thái thất bại:", err);
            if (rawTasks) setLocalTasks(rawTasks);
          },
        },
      );
    } else if (!targetStatus && rawTasks) {
      setLocalTasks(rawTasks);
    }
  };

  const handleOpenDetail = (task: Task) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const handleOpenCreate = (status = TaskStatus.PENDING) => {
    setEditingTask(null);
    setDefaultColumnStatus(status);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (formData: CreateTaskDto) => {
    const {
      tagIds,
      assignedTo,
      reminder,
      workspaceStyle: formWorkspaceStyle,
      teamId: formTeamId,
      ...baseDto
    } = formData;

    const finalWorkspaceStyle =
      (formWorkspaceStyle as WorkspaceStyle) ||
      (isTeamWorkspace ? WorkspaceStyle.TEAM : WorkspaceStyle.PERSONAL);

    const finalTeamId = formTeamId ?? teamId ?? undefined;
    const numericReminder = Number(reminder) || 0;

    if (editingTask) {
      const updatePayload = {
        ...baseDto,
        reminder: numericReminder,
        assignedTo: assignedTo ?? null,
      };

      updateTaskMutation?.mutate(
        {
          id: editingTask.id,
          dto: updatePayload,
        },
        {
          onSuccess: () => {
            if (tagIds !== undefined) {
              addTagsMutation.mutate({ taskId: editingTask.id, tagIds });
            }

            if (
              assignedTo !== undefined &&
              assignedTo !== editingTask.assignedTo
            ) {
              if (assignedTo) {
                assignTaskMutation.mutate({
                  id: editingTask.id,
                  assignedTo,
                });
              }
            }

            setLocalTasks((prev) =>
              prev.map((t) => {
                if (t.id === editingTask.id) {
                  const updatedTask = {
                    ...t,
                    ...baseDto,
                    reminder: numericReminder,
                    assignedTo: assignedTo ?? null,
                    taskTags: tagIds?.map((id) => {
                      const tagObj = availableTags.find((tag) => tag.id === id);
                      return {
                        tag: tagObj || { id, name: "Tag", color: "#64748b" },
                      };
                    }),
                  };
                  return updatedTask as unknown as Task;
                }
                return t;
              }),
            );
          },
        },
      );
    } else {
      const createPayload = {
        ...baseDto,
        reminder: numericReminder,
        assignedTo: assignedTo ?? null,
        teamId: finalTeamId,
        workspaceStyle: finalWorkspaceStyle,
      };

      createTaskMutation?.mutate(createPayload, {
        onSuccess: (response: any) => {
          const createdTask: Task = response?.data || response;

          if (createdTask && createdTask.id) {
            if (tagIds && tagIds.length > 0) {
              addTagsMutation.mutate({ taskId: createdTask.id, tagIds });
            }

            const fullNewTask = {
              ...createdTask,
              reminder: numericReminder,
              assignedTo: assignedTo ?? createdTask.assignedTo,
              taskTags: tagIds?.map((id) => {
                const tagObj = availableTags.find((tag) => tag.id === id);
                return {
                  tag: tagObj || { id, name: "Tag", color: "#64748b" },
                };
              }),
            } as unknown as Task;

            setLocalTasks((prev) => [...prev, fullNewTask]);
          }
        },
      });
    }
  };

  const handleDeleteTask = (id: number) => {
    setLocalTasks((prev) => prev.filter((t) => t.id !== id));
    softDeleteMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Loading Kanban board...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500 font-medium">
        Error: {error?.message}
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {COLUMNS.map((column) => {
            const columnTasks =
              filteredTasks.filter((task) => task.status === column.id) || [];

            return (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={columnTasks}
                onChangeStatus={(id, status) => {
                  setLocalTasks((prev) =>
                    prev.map((t) => (t.id === id ? { ...t, status } : t)),
                  );
                  changeStatusMutation.mutate({ id, status });
                }}
                onDelete={handleDeleteTask}
                onClickTask={handleOpenDetail}
                onAddTask={handleOpenCreate}
                teamMembers={teamMembers}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCardContent task={activeTask} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteTask}
        teamMembers={teamMembers}
      />

      <Suspense fallback={null}>
        <TaskFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={editingTask}
          defaultStatus={defaultColumnStatus}
          isTeamWorkspace={isTeamWorkspace}
          teamMembers={teamMembers}
          availableTags={availableTags}
        />
      </Suspense>
    </div>
  );
}
