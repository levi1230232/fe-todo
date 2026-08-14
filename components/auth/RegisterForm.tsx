"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { registerSchema, RegisterSchema } from "@/schemas/auth.schema";
import { useRegister } from "@/hooks/useAuth";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate: registerUser, isPending } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterSchema) => {
    const { confirmPassword: _, ...registerData } = data;

    registerUser(registerData, {
      onSuccess: () => {
        toast.success("Account created successfully! Please log in.");
        router.push("/login");
      },
      onError: (error: any) => {
        const message =
          error?.response?.data?.message ||
          "Registration failed. Please try again!";
        toast.error(message);
      },
    });
  };

  return (
    <Card
      className="
        mx-auto 
        w-full 
        max-w-md
        border-blue-100
        bg-white/90
        backdrop-blur-xl
        shadow-xl
      "
    >
      <CardHeader className="space-y-2">
        <CardTitle className="text-center text-3xl font-bold text-blue-900">
          Sign up
        </CardTitle>

        <CardDescription className="text-center text-slate-500">
          Create a new account to start using the application.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>

            <Input
              id="name"
              placeholder="John Doe"
              {...register("name")}
              className="
                border-blue-200
                bg-blue-50/40
                focus-visible:ring-blue-500
                focus-visible:border-blue-500
              "
            />

            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              type="email"
              placeholder="example@gmail.com"
              {...register("email")}
              className="
                border-blue-200
                bg-blue-50/40
                focus-visible:ring-blue-500
                focus-visible:border-blue-500
              "
            />

            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className="
                  pr-10
                  border-blue-200
                  bg-blue-50/40
                  focus-visible:ring-blue-500
                  focus-visible:border-blue-500
                "
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>

            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("confirmPassword")}
                className="
                  pr-10
                  border-blue-200
                  bg-blue-50/40
                  focus-visible:ring-blue-500
                  focus-visible:border-blue-500
                "
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="
              w-full
              bg-blue-600
              hover:bg-blue-700
              text-white
              shadow-md
              shadow-blue-200
            "
          >
            {isPending ? "Creating account..." : "Sign up"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>

          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-slate-400">or</span>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="
              font-medium
              text-blue-600
              hover:text-blue-700
              hover:underline
            "
          >
            Login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
