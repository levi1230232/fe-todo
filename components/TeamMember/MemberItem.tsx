"use client";

import { Crown, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { TeamMember } from "./TeamMemberManager";

export type MemberRole = "OWNER" | "ADMIN" | "MEMBER";

interface MemberItemProps {
  member: TeamMember;
  onSelectToDelete?: (member: TeamMember) => void;
  onRoleChange?: (member: TeamMember, newRole: MemberRole) => void;
  currentUserRole?: MemberRole | boolean;
  canManage: boolean;
}

export function MemberItem({
  member,
  onSelectToDelete,
  onRoleChange,
  currentUserRole,
  canManage,
}: MemberItemProps) {
  const isOwner = member.role === "OWNER";
  const isAdmin = member.role === "ADMIN";
  const isRegularMember = member.role === "MEMBER";

  const isCurrentUserOwner =
    currentUserRole === "OWNER" || currentUserRole === true;

  const displayName = member.user?.name || member.user?.email || "User";
  const initialLetter = displayName.charAt(0).toUpperCase();

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-slate-300 hover:shadow">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-white">
          {initialLetter}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="truncate text-sm font-semibold text-slate-800">
              {displayName}
            </p>

            {(isOwner || isAdmin) && (
              <Crown size={14} className="shrink-0 text-amber-500" />
            )}
          </div>

          <p className="truncate text-xs text-slate-500">
            {member.user?.email}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <div>
          {isOwner && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
              Project Leader
            </span>
          )}

          {isAdmin && (
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
              Admin
            </span>
          )}

          {isRegularMember && (
            <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
              Member
            </span>
          )}
        </div>

        {canManage && (
          <div className="flex items-center gap-1">
            {isRegularMember && (
              <button
                onClick={() => onRoleChange?.(member, "ADMIN")}
                className="rounded-md p-2 text-indigo-600 transition hover:bg-indigo-50"
                title="Promotion to Admin"
              >
                <ArrowUp size={15} />
              </button>
            )}

            {isAdmin && isCurrentUserOwner && (
              <button
                onClick={() => onRoleChange?.(member, "OWNER")}
                className="rounded-md p-2 text-amber-600 transition hover:bg-amber-50"
                title="Transfer Owner"
              >
                <Crown size={15} />
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => onRoleChange?.(member, "MEMBER")}
                className="rounded-md p-2 text-slate-600 transition hover:bg-slate-100"
                title="Demote Member"
              >
                <ArrowDown size={15} />
              </button>
            )}

            {!isOwner && onSelectToDelete && (
              <button
                onClick={() => onSelectToDelete(member)}
                className="rounded-md p-2 text-red-500 transition hover:bg-red-50"
                title="Remove member"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
