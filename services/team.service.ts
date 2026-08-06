import { api } from "@/lib/axios";
import { CreateTeamDto, UpdateTeamDto } from "@/types/team";

export const teamService = {
  getAllTeam() {
    return api.get("/teams");
  },
  getTeamById(id: number) {
    return api.get(`/teams/${id}`);
  },
  deleteTeam(id: number) {
    return api.delete(`/teams/${id}`);
  },
  createTeam(data: CreateTeamDto) {
    return api.post("/teams", data);
  },
  updateTeam(id: number, data: UpdateTeamDto) {
    return api.put(`/teams/${id}`, data);
  },
  getTeamMembers(id: number) {
    return api.get(`/teams/${id}/members`);
  },
  addMemberToTeam(id: number, memberId: number) {
    return api.post(`/teams/${id}/members`, { userId: memberId });
  },
  updateMemberRole(id: number, memberId: number, role: string) {
    return api.patch(`/teams/${id}/members/${memberId}`, { role });
  },
  removeMemberFromTeam(id: number, memberId: number) {
    return api.delete(`/teams/${id}/members/${memberId}`);
  },
  leaveTeam(id: number) {
    return api.delete(`/teams/${id}/leave`);
  },
};
