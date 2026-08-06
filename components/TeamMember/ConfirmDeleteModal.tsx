"use client";

import { Loader2, AlertTriangle } from "lucide-react";
import { TeamMember } from "./TeamMemberManager";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ConfirmDeleteModalProps {
  member: TeamMember | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({
  member,
  isDeleting,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  const isOpen = Boolean(member);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm p-5 space-y-4">
        <DialogHeader className="flex flex-row items-start gap-3 space-y-0 text-left">
          <div className="p-2 bg-red-50 text-red-600 rounded-full shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-sm font-semibold text-slate-900">
              Confirm Remove Member
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to remove{" "}
              {member?.user?.name || member?.user?.email} from this team?
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-2 pt-2 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white hover:bg-red-700 rounded-md transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {isDeleting && <Loader2 size={12} className="animate-spin" />}
            Remove Member
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
