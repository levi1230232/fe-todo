"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { CategoryOutput } from "@/schemas/category.schema";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";

interface CategoryItem extends Partial<CategoryOutput> {
  id?: number | string;
}

interface DeleteCategoryModalProps {
  open: boolean;
  category?: CategoryItem | null;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteCategoryModal({
  open,
  category,
  isDeleting = false,
  onClose,
  onConfirm,
}: DeleteCategoryModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val && !isDeleting) onClose();
      }}
    >
      <DialogOverlay className="bg-slate-900/20 backdrop-blur-[2px]" />

      <DialogContent className="max-w-sm rounded-2xl p-6 border border-slate-200/80 bg-white shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-8 ring-rose-50/50">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <h3 className="text-lg font-bold text-slate-800">Delete category</h3>

          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            Are you sure you want to delete the category{" "}
            <span className="font-semibold text-slate-800">
              "{category?.name || "này"}"
            </span>
            ? This action cannot be undone.
          </p>

          <div className="mt-6 flex w-full items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={isDeleting}
              onClick={onClose}
              className="w-1/2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isDeleting}
              onClick={onConfirm}
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
