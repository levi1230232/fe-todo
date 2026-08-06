import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamService } from "@/services/team.service";
import { TeamOutput } from "@/schemas/team.schema";
import { CreateTeamDto, UpdateTeamDto } from "@/types/team";

export const TEAMS_QUERY_KEY = {
  all: ["teams"] as const,
  list: () => [...TEAMS_QUERY_KEY.all, "list"] as const,
  members: (teamId: number) =>
    [...TEAMS_QUERY_KEY.all, teamId, "members"] as const,
  detail: (id: number) => [...TEAMS_QUERY_KEY.all, "detail", id] as const,
};

export function useTeamMembers(teamId: number) {
  return useQuery({
    queryKey: TEAMS_QUERY_KEY.members(teamId),
    queryFn: async () => {
      const res = await teamService.getTeamMembers(teamId);
      return res.data?.data || res.data || [];
    },
    enabled: !!teamId && teamId > 0,
  });
}

export function useTeam(id?: number) {
  return useQuery({
    queryKey: TEAMS_QUERY_KEY.detail(id!),
    queryFn: async () => {
      const res = await teamService.getTeamById(id!);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useTeams() {
  const queryClient = useQueryClient();

  const teamsQuery = useQuery({
    queryKey: TEAMS_QUERY_KEY.list(),
    queryFn: async () => {
      const res = await teamService.getAllTeam();
      return res.data?.data || res.data || [];
    },
  });

  const createTeamMutation = useMutation({
    mutationFn: (data: CreateTeamDto) => teamService.createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY.all });
    },
  });

  const updateTeamMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTeamDto }) =>
      teamService.updateTeam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY.all });
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: (id: number) => teamService.deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY.all });
    },
  });

  return {
    teams: teamsQuery.data || [],
    isLoading: teamsQuery.isLoading,
    isError: teamsQuery.isError,

    createTeam: createTeamMutation.mutateAsync,
    updateTeam: updateTeamMutation.mutateAsync,
    deleteTeam: deleteTeamMutation.mutateAsync,

    isCreating: createTeamMutation.isPending,
    isUpdating: updateTeamMutation.isPending,
    isDeleting: deleteTeamMutation.isPending,
  };
}

export function useTeamMemberMutations(teamId: number) {
  const queryClient = useQueryClient();

  const addMemberMutation = useMutation({
    mutationFn: (memberId: number) =>
      teamService.addMemberToTeam(teamId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEAMS_QUERY_KEY.members(teamId),
      });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: number) =>
      teamService.removeMemberFromTeam(teamId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEAMS_QUERY_KEY.members(teamId),
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: number; role: string }) =>
      teamService.updateMemberRole(teamId, memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEAMS_QUERY_KEY.members(teamId),
      });
    },
  });

  return {
    addMember: addMemberMutation.mutateAsync,
    removeMember: removeMemberMutation.mutateAsync,
    updateRole: updateRoleMutation.mutateAsync,
    isUpdatingRole: updateRoleMutation.isPending,
  };
}
export function useLeaveTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: number) => teamService.leaveTeam(teamId),
    onSuccess: (_, teamId) => {
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY.all });
      queryClient.invalidateQueries({
        queryKey: TEAMS_QUERY_KEY.members(teamId),
      });
    },
  });
}
