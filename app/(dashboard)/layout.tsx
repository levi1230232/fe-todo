"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import AppSidebar from "@/components/layout/app-sidebar";
import Header from "@/components/layout/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <SidebarInset>
          <Header onOpenMobile={() => setMobileOpen(true)} />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
