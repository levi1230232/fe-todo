"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Settings, ChevronDown, Menu } from "lucide-react";
import { useUser, useLogout } from "@/hooks/useAuth";
import { toast } from "sonner";
import { NotificationPopover } from "@/components/notification/NotificationPopover";
import { Notification } from "@/components/notification/NotificationItem";
import { NotificationDetailModal } from "@/components/notification/NotificationDetailModal";
import { SidebarTrigger } from "../ui/sidebar";

interface HeaderProps {
  onOpenMobile?: () => void;
}
export default function Header({ onOpenMobile }: HeaderProps) {
  const router = useRouter();

  const { data: user } = useUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const initialLetter = user?.name ? user.name[0].toUpperCase() : "U";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout(undefined, {
      onSuccess: () => {
        toast.success("Đăng xuất thành công");
        router.replace("/login");
      },
      onError: (error) => {
        console.error("Logout error:", error);
        toast.error("Có lỗi xảy ra khi đăng xuất");
      },
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
  };

  const handleDeleteNotification = (id: number) => {
    setSelectedNotification(null);
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-[64px] w-full items-center justify-between border-b bg-white/80 px-6 backdrop-blur-md">
        <button
          type="button"
          onClick={onOpenMobile}
          className="flex h-9 w-9 items-center justify-center rounded-lg border text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="ml-auto flex items-center gap-3">
          <NotificationPopover onNotificationClick={handleNotificationClick} />

          <div className="h-6 w-px bg-slate-200" />

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2.5 rounded-xl p-1.5 transition-colors hover:bg-slate-100 focus:outline-none"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white shadow-sm shadow-indigo-200">
                {initialLetter}
              </div>

              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold leading-tight text-slate-800">
                  {user?.name || "Guest"}
                </p>
                <p className="text-xs leading-tight text-slate-400">
                  {user?.email || "No email"}
                </p>
              </div>

              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2">
                <div className="border-b border-slate-100 px-3 py-2.5 md:hidden">
                  <p className="text-sm font-semibold text-slate-800">
                    {user?.name || "Guest"}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {user?.email || "No email"}
                  </p>
                </div>

                <div className="space-y-0.5 py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      router.push("/dashboard/profile");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-indigo-600"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </button>

                  {/* <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      router.push("/dashboard/settings");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-indigo-600"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button> */}
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <NotificationDetailModal
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
        onDelete={handleDeleteNotification}
      />
    </>
  );
}
