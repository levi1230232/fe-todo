import { api } from "@/lib/axios";
import { UpdateUserDto } from "@/types/auth";

export const UserService = {
  getUserByEmail: async (email: string) => {
    return await api.get("/users/find-by-email", {
      params: { email },
    });
  },
  updateProfile: async (data: UpdateUserDto) => {
    return await api.put("/users/me", data);
  },
};
