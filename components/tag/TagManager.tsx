"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  useCreateTag,
  useDeleteTag,
  useGetPersonalTags,
  useGetTeamTags,
  useUpdateTag,
} from "@/hooks/useTag";
import { Tag } from "@/types/tag";
import { Plus, X, Check, Edit2, Trash2 } from "lucide-react";
import { DeleteTagDialog } from "./DeleteTagModel";

interface TagManagerProps {
  canManage?: boolean;
}

export const TagManager = ({ canManage = true }: TagManagerProps) => {
  const searchParams = useSearchParams();
  const teamIdParam = searchParams.get("teamId");
  const teamId = teamIdParam ? Number(teamIdParam) : null;
  const isTeam = Boolean(teamId);

  const personalQuery = useGetPersonalTags();
  const teamQuery = useGetTeamTags(teamId ?? 0);

  const tags = isTeam ? teamQuery.data : personalQuery.data;
  const isLoading = isTeam ? teamQuery.isLoading : personalQuery.isLoading;

  const createTagMutation = useCreateTag();
  const updateTagMutation = useUpdateTag();
  const deleteTagMutation = useDeleteTag();

  const [isAdding, setIsAdding] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3B82F6");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim() || !canManage) return;

    await createTagMutation.mutateAsync({
      name: newTagName,
      color: newTagColor,
      ...(isTeam && teamId ? { teamId } : {}),
    });

    setNewTagName("");
    setNewTagColor("#3B82F6");
    setIsAdding(false);
  };

  const startEditing = (tag: Tag) => {
    if (!canManage) return;
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color || "#3B82F6");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    setEditColor("");
  };

  const handleUpdate = async (id: number) => {
    if (!editName.trim() || !canManage) return;

    await updateTagMutation.mutateAsync({
      id,
      data: { name: editName, color: editColor },
    });

    setEditingId(null);
  };

  const confirmDelete = async () => {
    if (!deletingTag || !canManage) return;

    await deleteTagMutation.mutateAsync(deletingTag.id);
    setDeletingTag(null);
  };

  return (
    <div className="w-full bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-800">
          Manage tags {isTeam ? "(Team)" : "(Personal)"}
        </h2>

        {canManage && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
            title="Add new tag"
          >
            {isAdding ? <X size={18} /> : <Plus size={18} />}
          </button>
        )}
      </div>

      {isAdding && canManage && (
        <form
          onSubmit={handleCreate}
          className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200 space-y-3"
        >
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={newTagColor}
              onChange={(e) => setNewTagColor(e.target.value)}
              className="w-7 h-7 rounded border cursor-pointer p-0 shrink-0 bg-transparent"
              title="Select Color"
            />
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Enter new tag name..."
              className="flex-1 px-2.5 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTagMutation.isPending}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Save Tag
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="text-xs text-gray-500">Đang tải...</p>
      ) : !tags || tags.length === 0 ? (
        <p className="text-xs text-gray-400 italic">Chưa có tag nào.</p>
      ) : (
        <ul className="space-y-2">
          {tags.map((tag: Tag) => {
            const isCurrentEditing = editingId === tag.id;

            return (
              <li
                key={tag.id}
                className="flex items-center justify-between p-2 rounded border border-gray-100 hover:bg-gray-50 transition min-h-[40px] w-full overflow-hidden"
              >
                {isCurrentEditing ? (
                  <div className="flex items-center gap-1.5 w-full min-w-0">
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="w-6 h-6 rounded border cursor-pointer p-0 shrink-0 bg-transparent"
                    />

                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 min-w-0 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />

                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => handleUpdate(tag.id)}
                        disabled={updateTagMutation.isPending}
                        className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                        title="Save"
                      >
                        <Check size={15} />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                        title="Cancel"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {tag.name}
                      </span>
                    </div>

                    {canManage && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => startEditing(tag)}
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingTag(tag)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <DeleteTagDialog
        tag={deletingTag}
        isOpen={Boolean(deletingTag)}
        isPending={deleteTagMutation.isPending}
        onClose={() => setDeletingTag(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};
