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

export function useMyTasks() {
  return useQuery({
    queryKey: TASK_KEYS.myTasks(),
    queryFn: () => taskService.getMyTasks(),
  });
}

export function useTasksByCategory(categoryId: number) {
  return useQuery({
    queryKey: TASK_KEYS.byCategory(categoryId),
    queryFn: () => taskService.getTaskByCategory(categoryId),
    enabled: !!categoryId,
  });
}

export function useTeamTasks(teamId: number) {
  return useQuery({
    queryKey: TASK_KEYS.teamTasks(teamId),
    queryFn: () => taskService.getTeamTasks(teamId),
    enabled: !!teamId,
  });
}

export function useTaskDetail(id: number) {
  return useQuery({
    queryKey: TASK_KEYS.detail(id),
    queryFn: () => taskService.findOne(id),
    enabled: !!id,
  });
}

export function useTodayTasks() {
  return useQuery({
    queryKey: TASK_KEYS.today(),
    queryFn: () => taskService.getTodayTasks(),
  });
}

export function useUpcomingTasks() {
  return useQuery({
    queryKey: TASK_KEYS.upcoming(),
    queryFn: () => taskService.getUpcomingTasks(),
  });
}

export function useOverdueTasks() {
  return useQuery({
    queryKey: TASK_KEYS.overdue(),
    queryFn: () => taskService.getOverdueTasks(),
  });
}

export function useGetDeletedTasks(teamId?: number, categoryId?: number) {
  return useQuery({
    queryKey: TASK_KEYS.deleted(teamId, categoryId),
    queryFn: () => taskService.getTaskDeleted(teamId, categoryId),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateTaskDto) => taskService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
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
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
  });
}

export function useChangeTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: TaskStatus }) => {
      console.log("CHANGE TASK STATUS:", { id, status });
      return taskService.changeStatus(id, status);
    },

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: TASK_KEYS.all });

      const previousTasks = queryClient.getQueryData(TASK_KEYS.all);

      queryClient.setQueriesData(
        { queryKey: TASK_KEYS.all },
        (oldData: any) => {
          if (!oldData) return oldData;

          if (Array.isArray(oldData)) {
            return oldData.map((task: Task) =>
              task.id === id ? { ...task, status } : task,
            );
          }

          if (oldData && Array.isArray(oldData.tasks)) {
            return {
              ...oldData,
              tasks: oldData.tasks.map((task: Task) =>
                task.id === id ? { ...task, status } : task,
              ),
            };
          }

          return oldData;
        },
      );

      return { previousTasks };
    },

    onError: (error: any, variables, context) => {
      // console.error("CHANGE STATUS ERROR:", {
      //   taskId: variables.id,
      //   status: variables.status,
      //   responseData: error?.response?.data,
      //   responseStatus: error?.response?.status,
      //   requestUrl: error?.config?.url,
      //   requestMethod: error?.config?.method,
      //   requestData: error?.config?.data,
      //   message: error?.message,
      // });

      if (context?.previousTasks) {
        queryClient.setQueryData(TASK_KEYS.all, context.previousTasks);
      }
    },

    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: TASK_KEYS.all,
      });

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
  });
}

export function useChangeTaskDeadline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dueTo }: { id: number; dueTo: Date | string }) =>
      taskService.changeDeadline(id, dueTo),
    onSuccess: () => {
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
    onSuccess: () => {
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
