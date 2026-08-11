import { api } from "@/lib/axios";
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskStatus,
  Priority,
  ApiResponse,
  AddTagsResponse,
} from "@/types/task";

export const taskService = {
  async create(dto: CreateTaskDto): Promise<ApiResponse> {
    // console.log("DTO:", dto);
    const response = await api.post<ApiResponse>("/tasks", dto);
    return response.data;
  },

  async findOne(id: number): Promise<Task> {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  async update(id: number, dto: UpdateTaskDto): Promise<ApiResponse> {
    const response = await api.put<ApiResponse>(`/tasks/${id}`, dto);
    return response.data;
  },

  async softDelete(id: number): Promise<ApiResponse> {
    const response = await api.patch<ApiResponse>(`/tasks/${id}/soft-delete`);
    return response.data;
  },

  async restoreTask(id: number): Promise<ApiResponse> {
    const response = await api.patch<ApiResponse>(`/tasks/${id}/restore`);
    return response.data;
  },

  async changeStatus(id: number, status: TaskStatus): Promise<ApiResponse> {
    const response = await api.patch<ApiResponse>(`/tasks/${id}/status`, {
      status,
    });
    return response.data;
  },

  async changePriority(id: number, priority: Priority): Promise<ApiResponse> {
    const response = await api.patch<ApiResponse>(`/tasks/${id}/priority`, {
      priority,
    });
    return response.data;
  },

  async changeDeadline(id: number, dueTo: string | Date): Promise<ApiResponse> {
    const response = await api.patch<ApiResponse>(`/tasks/${id}/deadline`, {
      dueTo,
    });
    return response.data;
  },

  async assignTask(id: number, assignedTo: number): Promise<ApiResponse> {
    const response = await api.patch<ApiResponse>(`/tasks/${id}/assign`, {
      assignedTo,
    });
    return response.data;
  },

  async getMyTasks(): Promise<Task[]> {
    const response = await api.get<Task[]>("/tasks/me");
    return response.data;
  },

  async getTeamTasks(teamId: number): Promise<Task[]> {
    const response = await api.get<Task[]>(`/tasks/team/${teamId}`);
    return response.data;
  },

  async getTodayTasks(): Promise<Task[]> {
    const response = await api.get<Task[]>("/tasks/today");
    return response.data;
  },

  async getUpcomingTasks(): Promise<Task[]> {
    const response = await api.get<Task[]>("/tasks/upcoming");
    return response.data;
  },

  async getOverdueTasks(): Promise<Task[]> {
    const response = await api.get<Task[]>("/tasks/overdue");
    return response.data;
  },

  async addTags(taskId: number, tagIds: number[]): Promise<AddTagsResponse> {
    const response = await api.post<AddTagsResponse>(`/tasks/${taskId}/tags`, {
      tagIds,
    });
    return response.data;
  },

  async removeTag(taskId: number, tagId: number): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(
      `/tasks/${taskId}/tags/${tagId}`,
    );
    return response.data;
  },

  async removeTask(id: number): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/tasks/${id}/permanent`);
    return response.data;
  },
  async getTaskByCategory(id: number): Promise<Task[]> {
    const response = await api.get<Task[]>(`/tasks/category/${id}`);
    return response.data;
  },
  async getTaskDeleted(teamId?: number, categoryId?: number): Promise<Task[]> {
    const params: Record<string, number> = {};

    if (typeof teamId === "number" && teamId > 0) {
      params.teamId = teamId;
    } else if (typeof categoryId === "number" && categoryId > 0) {
      params.categoryId = categoryId;
    }

    const response = await api.get<Task[]>("/tasks/deleted", {
      params,
    });

    return response.data;
  },
};
