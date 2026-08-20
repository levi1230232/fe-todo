"use client";

import { useState } from "react";
import { LogOut, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LeaveTeamButtonProps {
  onLeaveTeam?: () => Promise<void> | void;
  isMember?: boolean;
  isOwner?: boolean;
}

export function LeaveTeamButton({
  onLeaveTeam,
  isMember = true,
  isOwner = false,
}: LeaveTeamButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  if (!isMember || !onLeaveTeam) {
    return null;
  }

  const handleLeaveTeam = async () => {
    try {
      setIsLeaving(true);
      await onLeaveTeam();
      setIsOpen(false);
    } catch {
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
            <DialogTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              {isOwner && <AlertCircle className="text-amber-500" size={18} />}
              <span>
                {isOwner ? "Cannot Leave as Owner" : "Leave this team?"}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 pt-1">
              {isOwner
                ? "You are the Project Leader. You must transfer the Owner role to another member before leaving the team."
                : "Are you sure you want to leave this team? You will lose access to all tasks, tags, and resources."}
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
              {isOwner ? "Close" : "Cancel"}
            </Button>

            {!isOwner && (
              <Button
                type="button"
                variant="destructive"
                disabled={isLeaving}
                onClick={handleLeaveTeam}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 h-auto text-white"
              >
                {isLeaving && <Loader2 size={12} className="animate-spin" />}
                <span>Leave team</span>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
