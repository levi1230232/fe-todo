"use client";

import { useEffect, useRef } from "react";
import { Tag } from "@/types/tag";
import { AlertTriangle } from "lucide-react";

interface DeleteTagDialogProps {
  tag: Tag | null;
  isOpen: boolean;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteTagDialog = ({
  tag,
  isOpen,
  isPending,
  onClose,
  onConfirm,
}: DeleteTagDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  if (!isOpen || !tag) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          onClose();
        }
      }}
      className="p-0 bg-transparent backdrop:bg-black/40 backdrop:backdrop-blur-sm rounded-lg shadow-xl outline-none transition-all max-w-sm w-full m-auto"
    >
      <div className="bg-white rounded-lg p-5 border border-gray-100">
        <div className="flex items-center gap-3 text-red-600 mb-3">
          <div className="p-2 bg-red-100 rounded-full shrink-0">
            <AlertTriangle size={20} />
          </div>
          <h3 className="font-semibold text-gray-800 text-base"></h3>
        </div>

        <p className="text-xs text-gray-600 mb-4 leading-relaxed">
          Are you sure you want to delete the tag{" "}
          <span className="font-bold text-gray-800">"{tag.name}"</span>? This
          action cannot be undone.
        </p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-md border border-gray-200 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="px-3 py-1.5 text-xs bg-red-600 text-white font-medium rounded-md hover:bg-red-700 disabled:opacity-50 transition"
          >
            {isPending ? "Deleting..." : "Delete permanently"}
          </button>
        </div>
      </div>
    </dialog>
  );
};
