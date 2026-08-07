import GuestGuard from "@/components/auth/GuestGuard";
import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your account to continue.",
};

export default function Login() {
  return (
    <GuestGuard>
      <LoginForm />;
    </GuestGuard>
  );
}
