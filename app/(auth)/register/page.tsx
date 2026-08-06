import GuestGuard from "@/components/auth/GuestGuard";
import RegisterForm from "@/components/auth/RegisterForm";

export default function Register() {
  return (
    <GuestGuard>
      <RegisterForm />;
    </GuestGuard>
  );
}
