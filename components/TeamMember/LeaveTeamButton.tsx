"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LeaveTeamButtonProps {
  onLeaveTeam?: () => Promise<void> | void;
  isMemberOfTeam?: boolean;
}

export function LeaveTeamButton({
  onLeaveTeam,
  isMemberOfTeam = true,
}: LeaveTeamButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  if (!isMemberOfTeam || !onLeaveTeam) {
    return null;
  }

  const handleLeaveTeam = async () => {
    try {
      setIsLeaving(true);
      await onLeaveTeam();
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message);
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <>
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-red-600 hover:bg-red-50 py-2 rounded transition"
        >
          <LogOut size={14} />
          <span>Leave team</span>
        </button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-sm p-5 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-800">
              Are you sure you want to leave this project?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 pt-1">
              Are you sure you want to leave this project? You will lose access
              to all project resources.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              disabled={isLeaving}
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 h-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isLeaving}
              onClick={handleLeaveTeam}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 h-auto text-white"
            >
              {isLeaving && <Loader2 size={12} className="animate-spin" />}
              Leave team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
