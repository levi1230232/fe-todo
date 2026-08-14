export interface LoginDto {
  email: string;
  password: string;
}
export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface ForgotPasswordDto {
  email: string;
}
export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
}
export interface UpdateUserDto {
  name?: string;
}
