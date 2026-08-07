import GuestGuard from "@/components/auth/GuestGuard";
import RegisterForm from "@/components/auth/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create an Account",
  description: "Sign up to get started with your new account.",
};
export default function Register() {
  return (
    <GuestGuard>
      <RegisterForm />
    </GuestGuard>
  );
}
