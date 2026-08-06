import { api } from "@/lib/axios";
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from "@/types/auth";

export const authService = {
  login(data: LoginDto) {
    return api.post("/auth/login", data);
  },

  register(data: RegisterDto) {
    return api.post("/auth/register", data);
  },

  logout() {
    return api.post("/auth/logout");
  },

  refresh() {
    return api.post("/auth/refresh");
  },

  forgotPassword(data: ForgotPasswordDto) {
    return api.post("/auth/forgot-password", data);
  },

  resetPassword(data: ResetPasswordDto) {
    return api.post("/auth/reset-password", data);
  },

  me() {
    return api.get("/users/me");
  },
};
