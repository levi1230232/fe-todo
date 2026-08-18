"use client";

import { useState } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import { MemberItem, MemberRole } from "./MemberItem";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { AddMemberForm } from "./AddMemberForm";
import { LeaveTeamButton } from "./LeaveTeamButton";
import { toast } from "sonner";
import { TeamMember } from "@/types/team";

export interface SearchedUser {
  id: string | number;
  name: string;
  email: string;
}

interface TeamMemberManagerProps {
  teamId: number;
  members: TeamMember[];
  isLoading?: boolean;
  canManage?: boolean;
  isOwner?: boolean;
  isMemberOfTeam?: boolean;
  onSearchUserByEmail: (email: string) => Promise<SearchedUser | null>;
  onAddMember: (user: SearchedUser) => Promise<void> | void;
  onRemoveMember: (memberId: number) => Promise<void> | void;
  changeRole: (memberId: number, newRole: MemberRole) => Promise<void> | void;
  onLeaveTeam?: () => Promise<void> | void;
}

export function TeamMemberManager({
  members = [],
  isLoading = false,
  canManage = false,
  isOwner = false,
  isMemberOfTeam = false,
  onSearchUserByEmail,
  onAddMember,
  onRemoveMember,
  changeRole,
  onLeaveTeam,
}: TeamMemberManagerProps) {
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmRemove = async () => {
    if (!memberToDelete || !canManage) return;

    try {
      setIsDeleting(true);
      await onRemoveMember(memberToDelete.user.id);
      setMemberToDelete(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangeRole = async (member: TeamMember, newRole: MemberRole) => {
    if (!canManage) return;

    try {
      await changeRole(member.id, newRole);
    } catch (error: any) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Team Members ({members.length})
        </h3>

        {canManage && (
          <button
            onClick={() => setIsAddingMember((prev) => !prev)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded-full transition"
            title="Invite Member"
          >
            <UserPlus size={16} />
          </button>
        )}
      </div>

      {canManage && isAddingMember && (
        <AddMemberForm
          members={members}
          onSearchUserByEmail={onSearchUserByEmail}
          onAddMember={onAddMember}
          onCancel={() => setIsAddingMember(false)}
        />
      )}
      {isLoading ? (
        <div className="flex items-center justify-center py-6 text-slate-400">
          <Loader2 size={20} className="animate-spin mr-2" />
          <span className="text-xs">Loading member list...</span>
        </div>
      ) : members.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">
          No members in this project yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {members.map((member) => (
            <MemberItem
              key={member.id}
              member={member}
              canManage={canManage}
              isCurrentUserOwner={isOwner}
              onSelectToDelete={canManage ? setMemberToDelete : undefined}
              onRoleChange={canManage ? handleChangeRole : undefined}
            />
          ))}
        </ul>
      )}

      <LeaveTeamButton
        onLeaveTeam={onLeaveTeam}
        isMember={isMemberOfTeam}
        isOwner={isOwner}
      />
      {canManage && (
        <ConfirmDeleteModal
          member={memberToDelete}
          isDeleting={isDeleting}
          onClose={() => setMemberToDelete(null)}
          onConfirm={handleConfirmRemove}
        />
      )}
    </div>
  );
}
