"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, LoginSchema } from "@/schemas/auth.schema";
import { useLogin } from "@/hooks/useAuth"; // Import hook TanStack Query
import { Eye, EyeOff } from "lucide-react";

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
import { toast } from "sonner";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginSchema) => {
    login(data, {
      onSuccess: () => {
        toast.success("Login successfully");
        router.push("/dashboard");
      },
      onError: (err: any) => {
        const message =
          err?.response?.data?.message || "Invalid email or password  ";
        toast.error(message);
      },
    });
  };

  return (
    <Card
      className="mx-auto w-full max-w-md
      border-blue-100
      bg-white/90
      backdrop-blur-xl
      shadow-xl"
    >
      <CardHeader className="space-y-2">
        <CardTitle className="text-center text-3xl font-bold text-blue-900">
          Login
        </CardTitle>

        <CardDescription className="text-center text-slate-500">
          Log in to continue using the application.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>

              <Link
                href="/forgot-password"
                className="text-sm text-blue-600
                  hover:text-blue-700
                  hover:underline"
              >
                Forgot password?{" "}
              </Link>
            </div>

            <div className="relative">
              <Input
                id="password"
                type={isVisible ? "text" : "password"}
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
                onClick={() => setIsVisible(!isVisible)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
              >
                {isVisible ? (
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

          <Button
            type="submit"
            className="w-full bg-blue-600
              hover:bg-blue-700
              text-white
              shadow-md
              shadow-blue-200"
            disabled={isPending}
          >
            {isPending ? "Login..." : "Login"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>

          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-slate-400">Or</span>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account yet?
          <Link
            href="/register"
            className="font-medium
              text-blue-600
              hover:text-blue-700
              hover:underline"
          >
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
