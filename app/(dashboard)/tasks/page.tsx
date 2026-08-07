import type { Metadata } from "next";
import TaskPageClient from "@/components/task/TaskPageClient";

export const metadata: Metadata = {
  title: "Task Management",
  description:
    "Organize, track, and manage your personal and team tasks efficiently.",
};

export default function TaskPage() {
  return <TaskPageClient />;
}
