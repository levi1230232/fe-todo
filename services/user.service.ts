import { api } from "@/lib/axios";

export const UserService = {
  getUserByEmail: async (email: string) => {
    return await api.get("/users/find-by-email", {
      params: { email },
    });
  },
  updateProfile: async (data: any) => {
    return await api.put("/users/me", data);
  },
};
