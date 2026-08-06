import { api } from "@/lib/axios";
import { CreateCommentDto, UpdateCommentDto } from "@/types/comment";

export const CommentService = {
  createComment(data: CreateCommentDto) {
    return api.post("/comments", data);
  },
  getCommentByTask(taskId: number) {
    return api.get(`/comments/task/${taskId}`);
  },
  updateComment(id: number, data: UpdateCommentDto) {
    return api.patch(`/comments/task/${id}`, data);
  },
  deleteComment(id: number) {
    return api.delete(`/comments/${id}`);
  },
};
