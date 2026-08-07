import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Request a password reset for your account.",
};
export default function ForgotPassword() {
  return <ForgotPasswordForm />;
}
