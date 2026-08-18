export interface CreateTeamDto {
  name: string;
  description?: string;
}

export type UpdateTeamDto = Partial<CreateTeamDto>;
export interface TeamMember {
  id: number;
  joinAt: Date;
  role: "OWNER" | "ADMIN" | "MEMBER" | string;
  user: { id: number; name: string; email: string };
}
