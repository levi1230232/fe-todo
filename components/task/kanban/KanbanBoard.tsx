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
  CollisionDetection,
  pointerWithin,
  rectIntersection,
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
import { useUser } from "@/hooks/useAuth";

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
  const { data: currentUser } = useUser();
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
  const targetTaskStatusRef = useRef<TaskStatus | null>(null);

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
  const customCollisionDetectionAlgorithm: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }

    const rectCollisions = rectIntersection(args);
    if (rectCollisions.length > 0) {
      return rectCollisions;
    }

    return closestCorners(args);
  };

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
    const taskId = Number(event.active.id);
    const task = localTasks.find((t) => t.id === taskId);
    if (!task || !currentUser) return;

    if (isTeamWorkspace && teamMembers.length > 0) {
      const currentMember = teamMembers.find(
        (m) => String(m.user?.id ?? m.id) === String(currentUser.id),
      );
      const role = currentMember?.role?.toUpperCase();

      const isAssignee =
        task.assignedTo && String(task.assignedTo) === String(currentUser.id);
      const isCreator =
        task.createBy && String(task.createBy) === String(currentUser.id);
      const isAdminOrOwner = role === "ADMIN" || role === "OWNER";

      if (!isAssignee && !isCreator && !isAdminOrOwner) {
        return;
      }
    }

    setActiveTask(task);
    initialTaskStatusRef.current = task.status;
    targetTaskStatusRef.current = task.status;
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = Number(active.id);
    let targetStatus: TaskStatus | null = null;

    if (Object.values(TaskStatus).includes(over.id as TaskStatus)) {
      targetStatus = over.id as TaskStatus;
    } else {
      const overTask = localTasks.find((task) => task.id === Number(over.id));
      if (overTask) {
        targetStatus = overTask.status;
      }
    }

    if (!targetStatus) return;
    targetTaskStatusRef.current = targetStatus;

    setLocalTasks((prev) => {
      const currentTask = prev.find((task) => task.id === taskId);
      if (!currentTask || currentTask.status === targetStatus) {
        return prev;
      }

      return prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: targetStatus!,
            }
          : task,
      );
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const taskId = Number(active.id);
    const originalStatus = initialTaskStatusRef.current;
    const targetStatus = targetTaskStatusRef.current;

    setActiveTask(null);
    initialTaskStatusRef.current = null;
    targetTaskStatusRef.current = null;

    if (!over || !originalStatus || !targetStatus) {
      setLocalTasks(rawTasks);
      return;
    }

    if (originalStatus === targetStatus) {
      return;
    }

    changeStatusMutation.mutate(
      {
        id: taskId,
        status: targetStatus,
      },
      {
        onError: () => {
          setLocalTasks((prev) =>
            prev.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    status: originalStatus,
                  }
                : task,
            ),
          );
        },
      },
    );
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

  const mapTagsToTaskTags = (tagIds?: number[]) => {
    if (!tagIds || tagIds.length === 0) return [];
    return tagIds.map((id) => {
      const tagObj = availableTags.find((tag) => tag.id === id);
      return {
        tag: tagObj || { id, name: "Tag", color: "#64748b" },
      };
    });
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
                    taskTags: mapTagsToTaskTags(tagIds),
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
        onSuccess: async (response: any) => {
          const createdTask: Task = response?.data || response;

          if (!createdTask?.id) {
            console.error("Không lấy được taskId sau khi tạo task");
            return;
          }

          try {
            if (tagIds && tagIds.length > 0) {
              await addTagsMutation.mutateAsync({
                taskId: createdTask.id,
                tagIds,
              });
            }

            const mappedTags = mapTagsToTaskTags(tagIds);

            const fullNewTask: Task = {
              ...createdTask,
              reminder: numericReminder,
              assignedTo: assignedTo ?? createdTask.assignedTo,
              taskTags: mappedTags,
            } as Task;

            setLocalTasks((prev) => [...prev, fullNewTask]);
          } catch (error) {
            console.error("Lỗi khi tạo task hoặc gán tag:", error);

            const fallbackTask: Task = {
              ...createdTask,
              reminder: numericReminder,
              assignedTo: assignedTo ?? createdTask.assignedTo,
              taskTags: [],
            } as Task;

            setLocalTasks((prev) => [...prev, fallbackTask]);
          }
        },

        onError: (error) => {
          console.error("Lỗi khi tạo task:", error);
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
        // collisionDetection={closestCorners}
        collisionDetection={customCollisionDetectionAlgorithm}
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
