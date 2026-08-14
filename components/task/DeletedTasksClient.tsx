"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser, useLogout } from "@/hooks/useAuth";
import {
  useTodayTasks,
  useUpcomingTasks,
  useOverdueTasks,
  useMyTasks,
} from "@/hooks/useTask";
import { useNotifications } from "@/hooks/useNotification";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskList from "@/components/task/TaskList";
import { DashboardHeader } from "../dashboard/DashboardHeader";
import { DashboardStats } from "../dashboard/DashboardStats";
import { DashboardNotifications } from "../dashboard/DashboardNotifications";
import { DashboardChart } from "../dashboard/DashboardChart";

const NOTIFICATION_LIMIT = 5;

export default function DashboardClient() {
  const router = useRouter();
  const [notificationPage, setNotificationPage] = useState(1);

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const {
    data: todayTasks,
    isLoading: isTodayLoading,
    isError: isTodayError,
  } = useTodayTasks();

  const {
    data: upcomingTasks,
    isLoading: isUpcomingLoading,
    isError: isUpcomingError,
  } = useUpcomingTasks();

  const {
    data: overdueTasks,
    isLoading: isOverdueLoading,
    isError: isOverdueError,
  } = useOverdueTasks();

  const {
    data: myTasks,
    isLoading: isMyTasksLoading,
    isError: isMyTasksError,
  } = useMyTasks();

  const {
    notifications,
    pagination,
    isLoading: isNotificationsLoading,
  } = useNotifications({
    page: notificationPage,
    limit: NOTIFICATION_LIMIT,
  });

  const totalNotificationPages = useMemo(() => {
    if (pagination?.totalPages) return pagination.totalPages;
    if (pagination?.total)
      return Math.ceil(pagination.total / NOTIFICATION_LIMIT);
    return 1;
  }, [pagination]);

  useEffect(() => {
    if (isUserError) {
      router.replace("/login");
    }
  }, [isUserError, router]);

  useEffect(() => {
    const hasTaskError =
      isTodayError || isUpcomingError || isOverdueError || isMyTasksError;

    if (hasTaskError) {
      toast.error("Unable to load job list");
      router.push("/error");
    }
  }, [isTodayError, isUpcomingError, isOverdueError, isMyTasksError, router]);

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.success("Logout successfully");
        router.push("/login");
      },
      onError: () => {
        toast.error("Failed to logout");
      },
    });
  };

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  const todayCount = todayTasks?.length ?? 0;
  const upcomingCount = upcomingTasks?.length ?? 0;
  const overdueCount = overdueTasks?.length ?? 0;
  const totalCount = myTasks?.length ?? 0;

  return (
    <div className="ml-0 md:ml-14 max-w-full p-6 space-y-8 bg-slate-50 min-h-screen">
      <DashboardHeader
        userName={user.name}
        isLoggingOut={isLoggingOut}
        onLogout={handleLogout}
      />

      <DashboardStats
        totalCount={totalCount}
        todayCount={todayCount}
        upcomingCount={upcomingCount}
        overdueCount={overdueCount}
        isMyTasksLoading={isMyTasksLoading}
        isTodayLoading={isTodayLoading}
        isUpcomingLoading={isUpcomingLoading}
        isOverdueLoading={isOverdueLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-200/60 p-1">
              <TabsTrigger value="today">Today ({todayCount})</TabsTrigger>
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingCount})
              </TabsTrigger>
              <TabsTrigger value="overdue" className="text-rose-600">
                Overdue ({overdueCount})
              </TabsTrigger>
              <TabsTrigger value="all">All ({totalCount})</TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="mt-4">
              <TaskList
                tasks={todayTasks}
                isLoading={isTodayLoading}
                emptyText="You have no tasks today."
              />
            </TabsContent>

            <TabsContent value="upcoming" className="mt-4">
              <TaskList
                tasks={upcomingTasks}
                isLoading={isUpcomingLoading}
                emptyText="No upcoming tasks."
              />
            </TabsContent>

            <TabsContent value="overdue" className="mt-4">
              <TaskList
                tasks={overdueTasks}
                isLoading={isOverdueLoading}
                emptyText="Great job! No overdue tasks."
                isOverdue
              />
            </TabsContent>

            <TabsContent value="all" className="mt-4">
              <TaskList
                tasks={myTasks}
                isLoading={isMyTasksLoading}
                emptyText="You haven't created any tasks yet."
              />
            </TabsContent>
          </Tabs>

          <DashboardNotifications
            notifications={notifications || []}
            isLoading={isNotificationsLoading}
            page={notificationPage}
            totalPages={totalNotificationPages}
            onPageChange={setNotificationPage}
          />
        </div>

        <div className="space-y-6">
          <DashboardChart tasks={myTasks} />
        </div>
      </div>
    </div>
  );
}
