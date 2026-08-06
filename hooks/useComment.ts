import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CommentService } from "@/services/comment.service";
import { CreateCommentDto, UpdateCommentDto } from "@/types/comment";

export const useComment = (taskId?: number) => {
  const queryClient = useQueryClient();

  const commentsQueryKey = ["comments", taskId];

  const commentsQuery = useQuery({
    queryKey: commentsQueryKey,
    queryFn: () =>
      CommentService.getCommentByTask(taskId!).then((res) => res.data),
    enabled: !!taskId,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCommentDto) => CommentService.createComment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.taskId],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCommentDto }) =>
      CommentService.updateComment(id, data),
    onSuccess: () => {
      if (taskId) {
        queryClient.invalidateQueries({ queryKey: commentsQueryKey });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => CommentService.deleteComment(id),
    onSuccess: () => {
      if (taskId) {
        queryClient.invalidateQueries({ queryKey: commentsQueryKey });
      }
    },
  });

  return {
    comments: commentsQuery.data,
    isLoading: commentsQuery.isLoading,
    isError: commentsQuery.isError,
    error: commentsQuery.error,

    createComment: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateComment: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteComment: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
