"use client";

import { useState } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import { MemberItem, MemberRole } from "./MemberItem";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { AddMemberForm } from "./AddMemberForm";
import { LeaveTeamButton } from "./LeaveTeamButton";
import { useUser } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface TeamMember {
  id: number;
  joinAt: Date;
  role: "OWNER" | "ADMIN" | "MEMBER" | string;
  user: { id: string; name: string; email: string };
}

export interface SearchedUser {
  id: string | number;
  name: string;
  email: string;
}

interface TeamMemberManagerProps {
  teamId: number;
  members: TeamMember[];
  isLoading?: boolean;
  onSearchUserByEmail: (email: string) => Promise<SearchedUser | null>;
  onAddMember: (user: SearchedUser) => Promise<void> | void;
  onRemoveMember: (memberId: number) => Promise<void> | void;
  changeRole: (memberId: number, newRole: MemberRole) => Promise<void> | void;
  onLeaveTeam?: () => Promise<void> | void;
}

export function TeamMemberManager({
  teamId,
  members = [],
  isLoading = false,
  onSearchUserByEmail,
  onAddMember,
  onRemoveMember,
  changeRole,
  onLeaveTeam,
}: TeamMemberManagerProps) {
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: currentUser } = useUser();

  const currentMember = members.find(
    (m) => String(m.user.id) === String(currentUser?.id),
  );

  const canManage = currentMember?.role === "OWNER";

  const isOwner = currentMember?.role === "OWNER";
  const isMemberOfTeam = !!currentMember;

  const handleConfirmRemove = async () => {
    if (!memberToDelete || !canManage) return;

    try {
      setIsDeleting(true);
      await onRemoveMember(parseInt(memberToDelete.user.id));
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
              onSelectToDelete={canManage ? setMemberToDelete : undefined}
              onRoleChange={canManage ? handleChangeRole : undefined}
              currentUserRole={isOwner}
            />
          ))}
        </ul>
      )}

      <LeaveTeamButton
        onLeaveTeam={onLeaveTeam}
        isMemberOfTeam={isMemberOfTeam}
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
