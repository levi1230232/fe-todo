"use client";

import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Users, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import { teamSchema, TeamInput, TeamOutput } from "@/schemas/team.schema";
import { useTeams } from "@/hooks/useTeam";
import { toast } from "sonner";

interface TeamFormModalProps {
  open: boolean;
  editingTeam?: (Partial<TeamOutput> & { id?: number }) | null;
  onClose: () => void;
  onSuccess?: (team?: TeamOutput & { id: number }) => void;
}

export default function TeamFormModal({
  open,
  editingTeam,
  onClose,
  onSuccess,
}: TeamFormModalProps) {
  const { createTeam, updateTeam, isCreating, isUpdating } = useTeams();
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeamInput, any, TeamOutput>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: editingTeam?.name || "",
        description: editingTeam?.description || "",
      });
    }
  }, [open, editingTeam, reset]);

  const onSubmit: SubmitHandler<TeamOutput> = async (data) => {
    try {
      let res;
      if (editingTeam?.id) {
        res = await updateTeam({ id: editingTeam.id, data });
        toast.success(
          res.data.message
            ? res.data.message
            : `Team ${res.data.name} updated successfully`,
        );
      } else {
        res = await createTeam(data);
        toast.success(
          res.data.message
            ? res.data.message
            : `Team ${res.data.name} created successfully`,
        );
      }

      if (onSuccess) {
        const teamData = res?.data?.data || res?.data || res;
        onSuccess(teamData);
      } else {
        onClose();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val && !isSubmitting) {
          onClose();
        }
      }}
    >
      <DialogOverlay className="bg-slate-900/20 backdrop-blur-[2px]" />

      <DialogContent className="max-w-md rounded-2xl p-6 border border-slate-200/80 bg-white shadow-xl">
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold text-slate-800">
              {editingTeam ? "Edit team" : "Create new team"}
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs text-slate-500">
              {editingTeam
                ? "Update team information"
                : "Add new team to system"}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Team name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              disabled={isSubmitting}
              {...register("name")}
              className={`h-11 w-full rounded-xl border bg-slate-50/50 px-3.5 text-sm text-slate-800 outline-none transition-all focus:bg-white focus:ring-4 disabled:opacity-50 ${
                errors.name
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10"
                  : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10"
              }`}
              placeholder="e.g., Frontend Team, Marketing Team..."
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Team description
            </label>
            <textarea
              rows={3}
              disabled={isSubmitting}
              {...register("description")}
              className={`w-full resize-none rounded-xl border bg-slate-50/50 p-3 text-sm text-slate-800 outline-none transition-all focus:bg-white focus:ring-4 disabled:opacity-50 ${
                errors.description
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10"
                  : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10"
              }`}
              placeholder="Enter the role or operational goals of the team..."
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 active:bg-slate-200 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingTeam ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
