import { api } from "@/lib/axios";
import { CreateTagDto, UpdateTagDto } from "@/types/tag";

export const TagService = {
  getTagPersonal() {
    return api.get("/tags/personal");
  },
  getTagTeam(id: number) {
    return api.get(`/tags/team/${id}`);
  },
  getTagById(id: number) {
    return api.get(`/tags/${id}`);
  },
  createTag(data: CreateTagDto) {
    return api.post("/tags", data);
  },
  updateTag(data: UpdateTagDto, id: number) {
    return api.patch(`/tags/${id}`, data);
  },
  deleteTag(id: number) {
    return api.delete(`/tags/${id}`);
  },
};
