import { useMemo } from "react";
import { Task } from "@/types/task";
import { User } from "@/types/auth";
import { TeamMember } from "@/types/team";

export function useTeamPermission(
  currentUser: User | null | undefined,
  teamMembers: TeamMember[] = [],
) {
  return useMemo(() => {
    if (!currentUser) {
      return {
        role: null,
        isAdminOrOwner: false,
        canCreate: false,
        canDrag: () => false,
        canDelete: () => false,
        canEdit: () => false,
      };
    }

    const currentMember = teamMembers.find((m) => {
      const memberUserId = m.user?.id;
      return String(memberUserId) === String(currentUser.id);
    });

    const role = currentMember?.role?.toUpperCase() ?? null;
    const isAdminOrOwner = role === "ADMIN" || role === "OWNER";

    const isPersonalWorkspace = teamMembers.length === 0;

    const canCreate = isPersonalWorkspace || isAdminOrOwner;

    const canDrag = (task: Task) => {
      if (task.workspaceStyle === "PERSONAL" || isPersonalWorkspace) {
        return true;
      }

      if (isAdminOrOwner) return true;

      const isAssignee =
        task.assignedTo !== null &&
        task.assignedTo !== undefined &&
        String(task.assignedTo) === String(currentUser.id);

      const isCreator =
        task.createBy !== null &&
        task.createBy !== undefined &&
        String(task.createBy) === String(currentUser.id);

      return Boolean(isAssignee || isCreator);
    };

    const canDelete = (task: Task) => {
      if (task.workspaceStyle === "PERSONAL" || isPersonalWorkspace) {
        return true;
      }
      return isAdminOrOwner;
    };
    const canEdit = (task: Task) => {
      if (task.workspaceStyle === "PERSONAL" || isPersonalWorkspace) {
        return true;
      }
      return isAdminOrOwner;
    };

    return {
      role,
      isAdminOrOwner,
      canCreate,
      canDrag,
      canEdit,
      canDelete,
    };
  }, [currentUser, teamMembers]);
}
