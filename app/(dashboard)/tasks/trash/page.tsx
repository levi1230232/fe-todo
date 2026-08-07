import type { Metadata } from "next";
import DeletedTasksClient from "@/components/task/DeletedTasksClient";

export const metadata: Metadata = {
  title: "Task Recycle Bin",
  description: "View, restore, or permanently delete soft-deleted tasks.",
  robots: { index: false, follow: true },
};

export default function DeletedTasksPage() {
  return <DeletedTasksClient />;
}
