"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { authService } from "@/services/auth.service";
import {
  forgotPasswordSchema,
  ForgotPasswordSchema,
} from "@/schemas/auth.schema";

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
import { useEffect, useState } from "react";

export default function ForgotPasswordForm() {
  const [countdown, setCountdown] = useState(0);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordSchema) => {
    try {
      await authService.forgotPassword(data);

      toast.success("Password reset link sent.");

      setCountdown(15 * 60);

      reset();
    } catch (err) {
      console.error(err);
      toast.error("An error occurred. Please try again.");
    }
  };
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remain = seconds % 60;

    return `${minutes}:${remain.toString().padStart(2, "0")}`;
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
          Forgot password
        </CardTitle>

        <CardDescription className="text-center text-slate-500">
          Enter your registered email to receive a password reset link.
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
                focus-visible:border-blue-500
                focus-visible:ring-blue-500
              "
            />

            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Button
            className="w-full"
            type="submit"
            disabled={isSubmitting || countdown > 0}
          >
            {isSubmitting
              ? "Sending..."
              : countdown > 0
                ? `Resend in ${formatTime(countdown)}`
                : "Send reset link"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/login"
            className="
              font-medium
              text-blue-600
              hover:text-blue-700
              hover:underline
            "
          >
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
