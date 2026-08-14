import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DragStartEvent, DragOverEvent, DragEndEvent } from "@dnd-kit/core";

import {
  useMyTasks,
  useTeamTasks,
  useTasksByCategory,
  useChangeTaskStatus,
} from "@/hooks/useTask";
import { useTeamMembers } from "@/hooks/useTeam";
import { useGetPersonalTags, useGetTeamTags } from "@/hooks/useTag";
import { useUser } from "@/hooks/useAuth";
import { useTeamPermission } from "@/hooks/useTeamPermission";

import { Task, TaskStatus, Tag } from "@/types/task";
import {
  FilterState,
  filterTasks,
  groupTasksByStatus,
} from "@/lib/taskFilters";
import { TeamMember } from "@/components/task/kanban/types";

export function useKanbanTasks(teamId: number | null, filters?: FilterState) {
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

  const teamMembersQuery = useTeamMembers(teamId ?? 0);
  const teamMembers: TeamMember[] = isTeamWorkspace
    ? teamMembersQuery.data || []
    : [];

  const { data: currentUser } = useUser();
  const permissions = useTeamPermission(currentUser, teamMembers);

  const activeQuery = categoryId
    ? categoryTasksQuery
    : isTeamWorkspace
      ? teamTasksQuery
      : myTasksQuery;

  const { data: rawData, isLoading, isError, error } = activeQuery;
  const tasks: Task[] = rawData ?? [];

  const changeStatusMutation = useChangeTaskStatus();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const initialTaskStatusRef = useRef<TaskStatus | null>(null);
  const targetTaskStatusRef = useRef<TaskStatus | null>(null);

  const tasksByStatus = useMemo(() => {
    const filtered = filterTasks(tasks, filters, isTeamWorkspace);
    return groupTasksByStatus(filtered);
  }, [tasks, filters, isTeamWorkspace]);

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = Number(event.active.id);
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    setActiveTask(task);
    initialTaskStatusRef.current = task.status;
    targetTaskStatusRef.current = task.status;
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) return;

    let targetStatus: TaskStatus | null = null;
    if (Object.values(TaskStatus).includes(over.id as TaskStatus)) {
      targetStatus = over.id as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t.id === Number(over.id));
      if (overTask) {
        targetStatus = overTask.status;
      }
    }

    if (targetStatus) {
      targetTaskStatusRef.current = targetStatus;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const taskId = Number(active.id);
    const originalStatus = initialTaskStatusRef.current;
    const targetStatus = targetTaskStatusRef.current;

    setActiveTask(null);
    initialTaskStatusRef.current = null;
    targetTaskStatusRef.current = null;

    if (!over || !originalStatus || !targetStatus) return;

    const task = tasks.find((t) => t.id === taskId);
    if (
      !task ||
      !permissions.canDrag(task) ||
      originalStatus === targetStatus
    ) {
      return;
    }

    changeStatusMutation.mutate({
      id: taskId,
      status: targetStatus,
    });
  };

  return {
    tasks,
    tasksByStatus,
    isLoading,
    isError,
    error,
    isTeamWorkspace,
    availableTags,
    teamMembers,
    currentUser,
    permissions,
    activeTask,
    dndHandlers: {
      handleDragStart,
      handleDragOver,
      handleDragEnd,
    },
    changeStatus: (id: number, status: TaskStatus) =>
      changeStatusMutation.mutate({ id, status }),
  };
}
