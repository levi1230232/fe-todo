export interface CreateCommentDto {
  taskId: number;
  content: string;
}

export interface UpdateCommentDto extends Partial<CreateCommentDto> {}
