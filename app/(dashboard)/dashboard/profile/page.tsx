"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail, User, Save } from "lucide-react";

import { useUser, AUTH_QUERY_KEY } from "@/hooks/useAuth";
import { UserService } from "@/services/user.service";

interface ProfileFormData {
  name: string;
  email: string;
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: "",
      email: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name ?? "",
        email: user.email ?? "",
      });
    }
  }, [user, reset]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: { name: string }) => UserService.updateProfile(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: AUTH_QUERY_KEY,
      });

      toast.success("Profile updated successfully.");
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ?? "Failed to update profile.",
      );
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate({
      name: data.name,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-slate-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Profile Settings
          </h1>

          <p className="mt-2 text-slate-500">
            Manage your personal information and account details.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-3xl font-semibold text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 className="text-xl font-semibold">{user?.name}</h2>

              <p className="text-slate-500">{user?.email}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <User size={16} />
                Full Name
              </label>

              <input
                {...register("name", {
                  required: "Please enter your name.",
                })}
                placeholder="John Doe"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
              />

              {errors.name && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <Mail size={16} />
                Email Address
              </label>

              <input
                disabled
                {...register("email")}
                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
              />

              <p className="mt-2 text-xs text-slate-400">
                Email address cannot be changed.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold">Account Information</h2>

          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-slate-500">User ID</span>

              <span className="font-medium">#{user?.id}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Account Status</span>

              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                Active
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isDirty || updateProfileMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={18} />

            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
