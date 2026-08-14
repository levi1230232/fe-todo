import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CommentService } from "@/services/comment.service";
import { CreateCommentDto, UpdateCommentDto } from "@/types/comment";

export const useComment = (taskId?: number) => {
  const queryClient = useQueryClient();

  const numericTaskId = taskId ? Number(taskId) : undefined;
  const commentsQueryKey = ["comments", numericTaskId];

  const commentsQuery = useQuery({
    queryKey: commentsQueryKey,
    queryFn: () =>
      CommentService.getCommentByTask(numericTaskId!).then((res) => res.data),
    enabled: !!numericTaskId,
    refetchInterval: 3000,
    refetchIntervalInBackground: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCommentDto) => CommentService.createComment(data),
    onSuccess: (_, variables) => {
      const targetTaskId = variables.taskId
        ? Number(variables.taskId)
        : numericTaskId;
      queryClient.invalidateQueries({
        queryKey: ["comments", targetTaskId],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCommentDto }) =>
      CommentService.updateComment(id, data),
    onSuccess: () => {
      if (numericTaskId) {
        queryClient.invalidateQueries({
          queryKey: commentsQueryKey,
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["comments"] });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => CommentService.deleteComment(id),
    onSuccess: () => {
      if (numericTaskId) {
        queryClient.invalidateQueries({
          queryKey: commentsQueryKey,
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["comments"] });
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
