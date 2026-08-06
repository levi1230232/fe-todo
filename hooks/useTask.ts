import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskStatus,
  Priority,
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
    mutationFn: ({ id, status }: { id: number; status: TaskStatus }) =>
      taskService.changeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
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
