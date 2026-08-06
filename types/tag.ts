export interface Tag {
  id: number;
  name: string;
  color?: string;
  teamId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}
export interface CreateTagDto {
  name: string;
  color?: string;
  teamId?: number;
}

export type UpdateTagDto = Partial<CreateTagDto>;
