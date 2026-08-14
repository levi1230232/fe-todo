export interface CreateCommentDto {
  taskId: number;
  content: string;
}

export interface UpdateCommentDto extends Partial<CreateCommentDto> {}
export interface Comment {
  id: number;
  content: string;
  taskId: number;
  userId: number;
  createdAt: Date;
  user: { id: number; name: string; email: string };
}
