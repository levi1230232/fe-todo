export enum WorkspaceStyle {
  PERSONAL = "PERSONAL",
  TEAM = "TEAM",
}

export enum TaskStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  REVIEW = "REVIEW",
  COMPLETED = "COMPLETED",
}

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface UserSummary {
  id: number;
  name: string;
  email: string;
}

export interface CategorySummary {
  id: number;
  name: string;
}

export interface TeamSummary {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  dueTo?: string;
  reminder?: number;
  workspaceStyle: WorkspaceStyle;
  teamId?: number | null;
  categoryId?: number | null;
  createBy: number;
  assignedTo?: number | null;
  isSoftDelete: boolean;
  createdAt: string;
  updatedAt: string;
  creator?: UserSummary;
  assignee?: UserSummary;
  category?: CategorySummary;
  team?: TeamSummary | null;
  taskTags?: { tag: Tag }[];
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: Priority;
  status: TaskStatus;
  dueTo: string;
  reminder: number;
  workspaceStyle: WorkspaceStyle;
  teamId?: number | null;
  categoryId?: number | null;
  assignedTo?: number | null;
  tagIds?: number[];
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
}

export interface AddTagsResponse extends ApiResponse {
  added: number;
  skipped: number;
}
