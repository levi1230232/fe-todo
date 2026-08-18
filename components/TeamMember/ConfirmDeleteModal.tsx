"use client";

import { Loader2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TeamMember } from "@/types/team";

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
  const targetName = member?.user?.name || member?.user?.email || "this member";

  const handleOpenChange = (open: boolean) => {
    if (!open && !isDeleting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
              <span className="font-medium text-slate-700">{targetName}</span>{" "}
              from this team?
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-2 pt-2 sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isDeleting}
            className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 h-auto"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 h-auto text-white"
          >
            {isDeleting && <Loader2 size={12} className="animate-spin" />}
            <span>Remove Member</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
