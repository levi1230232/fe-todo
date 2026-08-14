import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskStatus,
  Priority,
  Task,
} from "@/types/task";
import { taskService } from "@/services/task.service";

export const TASK_KEYS = {
  all: ["tasks"] as const,
  myTasks: () => [...TASK_KEYS.all, "my-tasks"] as const,
  teamTasks: (teamId: number) => [...TASK_KEYS.all, "team", teamId] as const,
  today: () => [...TASK_KEYS.all, "today"] as const,
  upcoming: () => [...TASK_KEYS.all, "upcoming"] as const,
  overdue: () => [...TASK_KEYS.all, "overdue"] as const,
  detail: (id: number) => [...TASK_KEYS.all, "detail", id] as const,
  byCategory: (categoryId: number) =>
    [...TASK_KEYS.all, "category", categoryId] as const,
  deleted: (teamId?: number, categoryId?: number) =>
    [...TASK_KEYS.all, "deleted", { teamId, categoryId }] as const,
};

type TaskContainer =
  | Task[]
  | { data: Task[] }
  | { tasks: Task[] }
  | Record<string, unknown>;

const updateTaskInContainer = <T extends TaskContainer>(
  oldData: T | undefined,
  updatedTask: Partial<Task> & { id: number },
): T | undefined => {
  if (!oldData) return oldData;

  if (Array.isArray(oldData)) {
    return oldData.map((task) =>
      task.id === updatedTask.id ? { ...task, ...updatedTask } : task,
    ) as T;
  }

  if ("data" in oldData && Array.isArray((oldData as { data: Task[] }).data)) {
    const container = oldData as { data: Task[] };
    return {
      ...container,
      data: container.data.map((task) =>
        task.id === updatedTask.id ? { ...task, ...updatedTask } : task,
      ),
    } as T;
  }

  if (
    "tasks" in oldData &&
    Array.isArray((oldData as { tasks: Task[] }).tasks)
  ) {
    const container = oldData as { tasks: Task[] };
    return {
      ...container,
      tasks: container.tasks.map((task) =>
        task.id === updatedTask.id ? { ...task, ...updatedTask } : task,
      ),
    } as T;
  }

  return oldData;
};

const removeTaskFromContainer = <T extends TaskContainer>(
  oldData: T | undefined,
  taskId: number,
): T | undefined => {
  if (!oldData) return oldData;

  if (Array.isArray(oldData)) {
    return oldData.filter((task) => task.id !== taskId) as T;
  }

  if ("data" in oldData && Array.isArray((oldData as { data: Task[] }).data)) {
    const container = oldData as { data: Task[] };
    return {
      ...container,
      data: container.data.filter((task) => task.id !== taskId),
    } as T;
  }

  if (
    "tasks" in oldData &&
    Array.isArray((oldData as { tasks: Task[] }).tasks)
  ) {
    const container = oldData as { tasks: Task[] };
    return {
      ...container,
      tasks: container.tasks.filter((task) => task.id !== taskId),
    } as T;
  }

  return oldData;
};

export function useMyTasks() {
  return useQuery<Task[]>({
    queryKey: TASK_KEYS.myTasks(),
    queryFn: () => taskService.getMyTasks(),
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    throwOnError: true,
  });
}

export function useTeamTasks(teamId: number) {
  return useQuery<Task[]>({
    queryKey: TASK_KEYS.teamTasks(teamId),
    queryFn: () => taskService.getTeamTasks(teamId),
    enabled: !!teamId,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    throwOnError: true,
  });
}

export function useTasksByCategory(categoryId: number) {
  return useQuery<Task[]>({
    queryKey: TASK_KEYS.byCategory(categoryId),
    queryFn: () => taskService.getTaskByCategory(categoryId),
    enabled: !!categoryId,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    throwOnError: true,
  });
}

export function useTaskDetail(id: number) {
  return useQuery<Task>({
    queryKey: TASK_KEYS.detail(id),
    queryFn: () => taskService.findOne(id),
    enabled: !!id,
    throwOnError: true,
  });
}

export function useTodayTasks() {
  return useQuery<Task[]>({
    queryKey: TASK_KEYS.today(),
    queryFn: () => taskService.getTodayTasks(),
    throwOnError: true,
  });
}

export function useUpcomingTasks() {
  return useQuery<Task[]>({
    queryKey: TASK_KEYS.upcoming(),
    queryFn: () => taskService.getUpcomingTasks(),
    throwOnError: true,
  });
}

export function useOverdueTasks() {
  return useQuery<Task[]>({
    queryKey: TASK_KEYS.overdue(),
    queryFn: () => taskService.getOverdueTasks(),
    throwOnError: true,
  });
}

export function useGetDeletedTasks(teamId?: number, categoryId?: number) {
  return useQuery<Task[]>({
    queryKey: TASK_KEYS.deleted(teamId, categoryId),
    queryFn: () => taskService.getTaskDeleted(teamId, categoryId),
    throwOnError: true,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateTaskDto) => taskService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all, exact: false });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateTaskDto }) =>
      taskService.update(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: TASK_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all, exact: false });
    },
  });
}

export function useChangeTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: TaskStatus }) =>
      taskService.changeStatus(id, status),

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: TASK_KEYS.all });

      const previousQueries = queryClient.getQueriesData<TaskContainer>({
        queryKey: TASK_KEYS.all,
      });

      queryClient.setQueriesData<TaskContainer>(
        { queryKey: TASK_KEYS.all },
        (oldData) => updateTaskInContainer(oldData, { id, status }),
      );

      return { previousQueries };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, queryData]) => {
          queryClient.setQueryData(queryKey, queryData);
        });
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all, exact: false });
      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: TASK_KEYS.detail(variables.id),
        });
      }
    },
  });
}

export function useChangeTaskPriority() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, priority }: { id: number; priority: Priority }) =>
      taskService.changePriority(id, priority),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: TASK_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
  });
}

export function useChangeTaskDeadline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dueTo }: { id: number; dueTo: Date | string }) =>
      taskService.changeDeadline(id, dueTo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: TASK_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
  });
}

export function useAssignTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assignedTo }: { id: number; assignedTo: number }) =>
      taskService.assignTask(id, assignedTo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: TASK_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
  });
}

export function useSoftDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => taskService.softDelete(id),
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: TASK_KEYS.all });

      const previousQueries = queryClient.getQueriesData<TaskContainer>({
        queryKey: TASK_KEYS.all,
      });

      queryClient.setQueriesData<TaskContainer>(
        { queryKey: TASK_KEYS.all },
        (oldData) => removeTaskFromContainer(oldData, id),
      );

      return { previousQueries };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, queryData]) => {
          queryClient.setQueryData(queryKey, queryData);
        });
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
  });
}

export function useRestoreTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => taskService.restoreTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
  });
}

export function useRemoveTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => taskService.removeTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
  });
}

export function useAddTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, tagIds }: { taskId: number; tagIds: number[] }) =>
      taskService.addTags(taskId, tagIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: TASK_KEYS.detail(variables.taskId),
      });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
  });
}

export function useRemoveTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, tagId }: { taskId: number; tagId: number }) =>
      taskService.removeTag(taskId, tagId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: TASK_KEYS.detail(variables.taskId),
      });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
  });
}
