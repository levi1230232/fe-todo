"use client";

import React, { useState } from "react";
import { useComment } from "@/hooks/useComment";

interface TaskCommentSectionProps {
  taskId: number;
  currentUserId?: number;
  currentRole: "OWNER" | "ADMIN" | "MEMBER" | string;
}

export function TaskCommentSection({
  taskId,
  currentUserId,
  currentRole,
}: TaskCommentSectionProps) {
  const [content, setContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const {
    comments,
    isLoading,
    createComment,
    isCreating,
    updateComment,
    isUpdating,
    deleteComment,
  } = useComment(taskId);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await createComment({ taskId, content: content.trim() });
      setContent("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleStartEdit = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const handleSaveEdit = async (commentId: number) => {
    if (!editingContent.trim()) return;

    try {
      await updateComment({
        id: commentId,
        data: { content: editingContent.trim() },
      });
      setEditingCommentId(null);
    } catch (error) {
      console.error("Failed to edit comment:", error);
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      await deleteComment(commentId);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  return (
    <div className="pt-3 border-t border-slate-100 space-y-3">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Comments
      </h4>

      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
        />
        <button
          type="submit"
          disabled={isCreating || !content.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 shrink-0"
        >
          {isCreating ? "Sending..." : "Send"}
        </button>
      </form>

      {isLoading ? (
        <div className="text-xs text-slate-400 py-2">Loading comments...</div>
      ) : (
        <div className="space-y-2">
          {comments && comments.length > 0 ? (
            comments.map((comment: any) => {
              const isOwner =
                currentUserId &&
                (comment.userId === currentUserId ||
                  comment.user?.id === currentUserId);

              return (
                <div
                  key={comment.id}
                  className="bg-slate-50 p-2.5 rounded-lg text-xs space-y-1 border border-slate-100 group"
                >
                  {editingCommentId === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        rows={2}
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingCommentId(null)}
                          className="px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-200 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(comment.id)}
                          disabled={isUpdating}
                          className="px-2 py-1 text-[11px] bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">
                          {comment.user?.name || comment.user?.email || "User"}
                        </span>
                        <div className="flex items-center gap-2">
                          {comment.createdAt && (
                            <span className="text-[10px] text-slate-400">
                              {new Date(comment.createdAt).toLocaleTimeString(
                                "vi-VN",
                                {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-slate-600 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          {isOwner && (
                            <button
                              type="button"
                              onClick={() => handleStartEdit(comment)}
                              className="text-[12px] text-blue-600 hover:underline"
                            >
                              Edit
                            </button>
                          )}
                          {(isOwner ||
                            currentRole === "ADMIN" ||
                            currentRole === "OWNER") && (
                            <button
                              type="button"
                              onClick={() => handleDelete(comment.id)}
                              className="text-[12px] text-red-500 hover:underline"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 italic py-1">
              No comments yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
