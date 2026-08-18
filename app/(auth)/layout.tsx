import Image from "next/image";
import AuthHero from "./../../components/auth/AuthHero";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex">
      <section className="relative hidden md:block md:w-1/2">
        <Image
          src="/bg-login.png"
          alt="Auth background"
          fill
          sizes="50vw"
          priority
          className="object-cover"
        />

        <div
          className="
          absolute inset-0 
          bg-gradient-to-br 
          from-blue-900/60 
          via-blue-700/40 
          to-transparent
        "
        />

        <AuthHero />
      </section>

      <section
        className="
          w-full md:w-1/2 
          flex items-center justify-center 
          px-6

          bg-gradient-to-br
          from-blue-50
          via-white
          to-blue-100
        "
      >
        {children}
      </section>
    </main>
  );
}
