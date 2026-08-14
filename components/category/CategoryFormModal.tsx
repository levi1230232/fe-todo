"use client";

import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Palette, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  categorySchema,
  CategoryInput,
  CategoryOutput,
} from "@/schemas/category.schema";
import { useCategories } from "@/hooks/useCategories";
import axios, { AxiosResponse } from "axios";
import { CategoryResponse } from "@/types/category";
import { toast } from "sonner";

interface CategoryFormModalProps {
  open: boolean;
  editingCategory?: (Partial<CategoryOutput> & { id?: number }) | null;
  onClose: () => void;
  onSuccess?: (category?: CategoryOutput & { id: number }) => void;
}

export default function CategoryFormModal({
  open,
  editingCategory,
  onClose,
  onSuccess,
}: CategoryFormModalProps) {
  const { createCategory, updateCategory, isCreating, isUpdating } =
    useCategories();
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryInput, any, CategoryOutput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#3B82F6",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: editingCategory?.name || "",
        description: editingCategory?.description || "",
        color: editingCategory?.color || "#3B82F6",
      });
    }
  }, [open, editingCategory, reset]);

  const currentColor = watch("color");

  const onSubmit: SubmitHandler<CategoryOutput> = async (data) => {
    try {
      let res: AxiosResponse<CategoryResponse>;
      if (editingCategory?.id) {
        res = await updateCategory({ id: editingCategory.id, data });
        toast.success(`Category "${res.data.name}" updated successfully!`);
      } else {
        res = await createCategory(data);
        toast.success(`Category "${res.data.name}" created successfully!`);
      }

      const categoryData = res.data;

      if (onSuccess) {
        onSuccess(categoryData);
      } else {
        onClose();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "An error occurred";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md rounded-2xl p-6 border-slate-100 shadow-2xl">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="text-xl font-bold text-slate-800">
            {editingCategory ? "Edit category" : "Add Category"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {editingCategory
              ? "Update Current Category Information"
              : "Enter Information to Create a New Category"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Category name <span className="text-rose-500">*</span>
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
              placeholder="e.g., Work, Tasks..."
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Description
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
              placeholder="Enter a short description for this category..."
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Category color
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-2.5">
              <label
                className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg shadow-sm ring-1 ring-black/5 transition-transform active:scale-95"
                style={{ backgroundColor: currentColor || "#3B82F6" }}
              >
                <input
                  type="color"
                  disabled={isSubmitting}
                  value={currentColor || "#3B82F6"}
                  onChange={(e) =>
                    setValue("color", e.target.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  className="absolute inset-0 cursor-pointer opacity-0 h-full w-full disabled:cursor-not-allowed"
                />
                <Palette className="h-4 w-4 text-white drop-shadow-md" />
              </label>

              <div className="flex flex-col">
                <span className="text-xs text-slate-400">HEX color code</span>
                <span className="font-mono text-sm font-semibold uppercase text-slate-700">
                  {currentColor || "#3B82F6"}
                </span>
              </div>
            </div>
            {errors.color && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.color.message}
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
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/30 active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingCategory ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
