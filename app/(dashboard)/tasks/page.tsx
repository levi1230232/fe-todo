import type { Metadata } from "next";
import { redirect } from "next/navigation";
import TaskPageClient from "@/components/task/TaskPageClient";

export const metadata: Metadata = {
  title: "Task Management",
  description:
    "Organize, track, and manage your personal and team tasks efficiently.",
};

interface TaskPageProps {
  searchParams: Promise<{
    workspaceStyle?: string;
    categoryId?: string;
    teamId?: string;
  }>;
}

export default async function TaskPage({ searchParams }: TaskPageProps) {
  const { workspaceStyle, categoryId, teamId } = await searchParams;

  const isPersonal = workspaceStyle === "PERSONAL" && !!categoryId && !teamId;

  const isTeam = workspaceStyle === "TEAM" && !!teamId && !categoryId;

  if (!isPersonal && !isTeam) {
    redirect("/dashboard");
  }

  return <TaskPageClient />;
}
