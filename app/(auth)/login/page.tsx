import GuestGuard from "@/components/auth/GuestGuard";
import LoginForm from "@/components/auth/LoginForm";

export default function Login() {
  return (
    <GuestGuard>
      <LoginForm />;
    </GuestGuard>
  );
}
