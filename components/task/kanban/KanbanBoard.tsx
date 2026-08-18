"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  CollisionDetection,
  pointerWithin,
  rectIntersection,
} from "@dnd-kit/core";

import {
  useSoftDeleteTask,
  useCreateTask,
  useUpdateTask,
  useAddTags,
  useAssignTask,
  useRemoveTag,
} from "@/hooks/useTask";

import { Task, TaskStatus, WorkspaceStyle, CreateTaskDto } from "@/types/task";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCardContent } from "./TaskCardContent";
import { TaskFormModal } from "./TaskFormModal";
import { TaskDetailModal } from "./TaskDetailModal";
import { COLUMNS, KanbanBoardProps } from "./types";
import { useKanbanTasks } from "@/hooks/useKanbanTasks";
import { toast } from "sonner";

const customCollisionDetectionAlgorithm: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) return pointerCollisions;

  const rectCollisions = rectIntersection(args);
  if (rectCollisions.length > 0) return rectCollisions;

  return closestCorners(args);
};

export default function KanbanBoard({
  teamId = null,
  filters,
}: KanbanBoardProps) {
  const {
    tasks,
    tasksByStatus,
    isLoading,
    isError,
    error,
    isTeamWorkspace,
    availableTags,
    teamMembers,
    currentUser,
    permissions,
    activeTask,
    dndHandlers,
    changeStatus,
  } = useKanbanTasks(teamId, filters);

  const softDeleteMutation = useSoftDeleteTask();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const addTagsMutation = useAddTags();
  const assignTaskMutation = useAssignTask();
  const removeTagMutation = useRemoveTag();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [defaultColumnStatus, setDefaultColumnStatus] = useState<TaskStatus>(
    TaskStatus.PENDING,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const handleOpenDetail = (task: Task) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const handleOpenCreate = (status = TaskStatus.PENDING) => {
    setEditingTask(null);
    setDefaultColumnStatus(status);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleDeleteTask = (id: number) => {
    softDeleteMutation.mutate(id);
  };

  const handleRemoveTag = (taskId: number, tagId: number) => {
    removeTagMutation.mutate(
      { taskId, tagId },
      {
        onSuccess: () => {
          setSelectedTask((prev) => {
            if (!prev || prev.id !== taskId) return prev;
            return {
              ...prev,
              taskTags: (prev.taskTags || []).filter(
                ({ tag }) => Number(tag.id) !== Number(tagId),
              ),
            };
          });
        },
      },
    );
  };

  const handleFormSubmit = async (formData: CreateTaskDto) => {
    const {
      tagIds = [],
      assignedTo,
      reminder,
      workspaceStyle: formWorkspaceStyle,
      teamId: formTeamId,
      ...baseDto
    } = formData;

    const finalWorkspaceStyle =
      (formWorkspaceStyle as WorkspaceStyle) ||
      (isTeamWorkspace ? WorkspaceStyle.TEAM : WorkspaceStyle.PERSONAL);

    const finalTeamId = formTeamId ?? teamId ?? undefined;
    const numericReminder = Number(reminder) || 0;

    try {
      if (editingTask) {
        const updatePayload = {
          ...baseDto,
          reminder: numericReminder,
          assignedTo: assignedTo ?? null,
        };
        await updateTaskMutation.mutateAsync({
          id: editingTask.id,
          dto: updatePayload,
        });
        const currentTagIds = (editingTask.taskTags || [])
          .map(({ tag }) => Number(tag.id))
          .filter((id) => !isNaN(id));

        const nextTagIds = (tagIds || [])
          .map(Number)
          .filter((id) => !isNaN(id));

        const tagsToAdd = nextTagIds.filter(
          (id) => !currentTagIds.includes(id),
        );
        const tagsToRemove = currentTagIds.filter(
          (id) => !nextTagIds.includes(id),
        );
        if (tagsToRemove.length > 0) {
          await Promise.all(
            tagsToRemove.map((tagId) =>
              removeTagMutation.mutateAsync({ taskId: editingTask.id, tagId }),
            ),
          );
        }
        if (tagsToAdd.length > 0) {
          await addTagsMutation.mutateAsync({
            taskId: editingTask.id,
            tagIds: tagsToAdd,
          });
        }
        if (
          assignedTo !== undefined &&
          assignedTo !== editingTask.assignedTo &&
          assignedTo !== null
        ) {
          await assignTaskMutation.mutateAsync({
            id: editingTask.id,
            assignedTo,
          });
        }
      } else {
        const createPayload = {
          ...baseDto,
          reminder: numericReminder,
          assignedTo: assignedTo ?? null,
          teamId: finalTeamId,
          workspaceStyle: finalWorkspaceStyle,
        };

        const response = await createTaskMutation.mutateAsync(createPayload);
        const createdTask: Task = response?.data || response;

        if (createdTask?.id && tagIds && tagIds.length > 0) {
          await addTagsMutation.mutateAsync({
            taskId: createdTask.id,
            tagIds,
          });
        }
      }

      setIsFormOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Loading Kanban board...
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetectionAlgorithm}
        onDragStart={dndHandlers.handleDragStart}
        onDragOver={dndHandlers.handleDragOver}
        onDragEnd={dndHandlers.handleDragEnd}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {COLUMNS.map((column) => {
            const columnTasks = tasksByStatus[column.id] || [];

            return (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={columnTasks}
                onChangeStatus={(id, status) => changeStatus(id, status)}
                onDelete={handleDeleteTask}
                onClickTask={handleOpenDetail}
                onAddTask={handleOpenCreate}
                teamMembers={teamMembers}
                currentUser={currentUser}
                canDrag={permissions.canDrag}
                canEdit={permissions.canEdit}
                canDelete={permissions.canDelete}
                canCreate={permissions.canCreate}
              />
            );
          })}
        </div>

        <DragOverlay
          dropAnimation={{
            duration: 200,
            easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
          }}
        >
          {activeTask ? (
            <div className="rotate-2 scale-105 opacity-90 shadow-2xl rounded-xl ring-2 ring-blue-500/30 cursor-grabbing">
              <TaskCardContent
                task={activeTask}
                isOverlay
                teamMembers={teamMembers}
                currentUser={currentUser}
                canDelete={permissions.canDelete(activeTask)}
                canEdit={permissions.canEdit(activeTask)}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteTask}
        onRemoveTag={handleRemoveTag}
        teamMembers={teamMembers}
        currentUser={currentUser}
        canEditTask={selectedTask ? permissions.canEdit(selectedTask) : false}
        canDeleteTask={
          selectedTask ? permissions.canDelete(selectedTask) : false
        }
      />

      <TaskFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingTask}
        defaultStatus={defaultColumnStatus}
        isTeamWorkspace={isTeamWorkspace}
        teamMembers={teamMembers}
        availableTags={availableTags}
      />
    </div>
  );
}
