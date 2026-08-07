import DashboardClient from "@/components/dashboard/DashboardClient";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "View your personal task overview, daily statistics, and recent notifications.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
