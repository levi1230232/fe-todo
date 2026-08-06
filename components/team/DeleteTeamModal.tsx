"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";

interface Team {
  id?: string | number;
  name?: string;
  [key: string]: unknown;
}

interface DeleteTeamModalProps {
  open: boolean;
  team?: Team | null;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteTeamModal({
  open,
  team,
  isDeleting = false,
  onClose,
  onConfirm,
}: DeleteTeamModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val && !isDeleting) {
          onClose();
        }
      }}
    >
      <DialogOverlay className="bg-slate-900/20 backdrop-blur-[2px]" />

      <DialogContent className="max-w-sm rounded-2xl p-6 border border-slate-200/80 bg-white shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-8 ring-rose-50/50">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <h3 className="text-lg font-bold text-slate-800">
            Delete This Group?
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Are you sure you want to delete the team{" "}
            <span className="font-semibold text-slate-800">
              "{team?.name || "này"}"
            </span>
            ? All associated permission data may be affected.
          </p>

          <div className="mt-6 flex w-full items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="w-1/2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex w-1/2 items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-sm font-medium text-white shadow-md shadow-rose-600/20 transition-all hover:bg-rose-700 active:scale-95 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete now"
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
