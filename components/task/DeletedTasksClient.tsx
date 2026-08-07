"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  ArrowLeft,
  Folder,
  Users,
  Search,
  Calendar,
  Tag as TagIcon,
  Archive,
} from "lucide-react";
import {
  useGetDeletedTasks,
  useRestoreTask,
  useRemoveTask,
} from "@/hooks/useTask";
import { useCategory } from "@/hooks/useCategories";
import { useTeam, useTeamMembers } from "@/hooks/useTeam";
import { Task } from "@/types/task";
import { toast } from "sonner";
import { useUser } from "@/hooks/useAuth";

export default function DeletedTasksClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: user } = useUser();

  const teamIdParam = searchParams.get("teamId");
  const teamId = teamIdParam ? Number(teamIdParam) : undefined;

  const categoryIdParam = searchParams.get("categoryId");
  const categoryId = categoryIdParam ? Number(categoryIdParam) : undefined;

  const { data: deletedTasks = [], isLoading } = useGetDeletedTasks(
    teamId,
    categoryId,
  );
  const { data: team } = useTeam(teamId);
  const { data: category } = useCategory(categoryId);

  const { data: teamMembers = [] } = useTeamMembers(teamId || 0);

  const currentMember = teamMembers.find(
    (member: any) => String(member.user?.id) === String(user?.id),
  );

  const canManage =
    !teamId ||
    currentMember?.role === "OWNER" ||
    currentMember?.role === "ADMIN";

  const restoreTaskMutation = useRestoreTask();
  const removeTaskMutation = useRemoveTask();

  const [filterText, setFilterText] = useState("");
  const [taskToDelete, setTaskToDelete] = useState<{
    id: number;
    title: string;
  } | null>(null);

  const handleRestore = async (id: number) => {
    try {
      await restoreTaskMutation.mutateAsync(id);
    } catch (error: any) {
      console.error("Lỗi khi khôi phục task:", error);
      toast.error(error?.response?.data?.message);
    }
  };

  const handleConfirmPermanentDelete = async () => {
    if (!taskToDelete) return;
    try {
      await removeTaskMutation.mutateAsync(taskToDelete.id);
      setTaskToDelete(null);
    } catch (error) {
      console.error("Lỗi khi xóa vĩnh viễn task:", error);
    }
  };

  const filteredTasks = deletedTasks.filter((task: Task) =>
    task.title?.toLowerCase().includes(filterText.toLowerCase()),
  );

  return (
    <div className="ml-14 flex flex-col h-screen bg-slate-50 overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            title="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Archive className="text-red-500" size={22} />
              <h1 className="text-xl font-bold text-slate-800">
                Task Recycle Bin
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              List of temporarily deleted tasks. You can restore or permanently
              delete them.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {team && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Users size={13} />
              {team.name}
            </span>
          )}
          {category && (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
              style={{
                backgroundColor: category.color
                  ? `${category.color}15`
                  : "#EFF6FF",
                color: category.color || "#1D4ED8",
                borderColor: category.color ? `${category.color}30` : "#DBEAFE",
              }}
            >
              <Folder size={13} />
              {category.name}
            </span>
          )}
        </div>
      </header>

      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="relative max-w-md w-full">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search by task name..."
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>
        <span className="text-xs font-medium text-slate-500">
          Total:{" "}
          <strong className="text-slate-800">{filteredTasks.length}</strong>{" "}
          tasks
        </span>
      </div>

      <main className="flex-1 p-6 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center">
            <div className="p-4 bg-slate-100 rounded-full mb-3 text-slate-400">
              <Trash2 size={32} />
            </div>
            <h3 className="text-base font-semibold text-slate-700">
              Trash is empty
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              No deleted tasks in this category or group.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task: any) => (
              <div
                key={task.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-slate-800 line-clamp-2">
                      {task.title}
                    </h3>
                    {task.priority && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                          task.priority === "HIGH"
                            ? "bg-red-100 text-red-700"
                            : task.priority === "MEDIUM"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {task.priority}
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                      {task.description}
                    </p>
                  )}

                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {task.tags.map((tag: any) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600"
                        >
                          <TagIcon size={10} />
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar size={13} />
                    <span>
                      {task.dueTo
                        ? new Date(task.dueTo).toLocaleDateString("vi-VN")
                        : "Đã xóa"}
                    </span>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestore(task.id)}
                        disabled={restoreTaskMutation.isPending}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition disabled:opacity-50"
                        title="Restore task"
                      >
                        <RotateCcw size={13} />
                        Restore
                      </button>

                      <button
                        onClick={() =>
                          setTaskToDelete({ id: task.id, title: task.title })
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Delete permanently"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {taskToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Confirm Permanent Deletion
              </h3>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Are you sure you want to permanently delete the task{" "}
              <strong className="text-slate-900">"{taskToDelete.title}"</strong>
              ? This action{" "}
              <span className="text-red-600 font-semibold">
                cannot be undone
              </span>
              .
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setTaskToDelete(null)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPermanentDelete}
                disabled={removeTaskMutation.isPending}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition shadow-sm disabled:opacity-50"
              >
                {removeTaskMutation.isPending ? "Deleting.." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
