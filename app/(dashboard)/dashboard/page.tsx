"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser, useLogout } from "@/hooks/useAuth";
import {
  useTodayTasks,
  useUpcomingTasks,
  useOverdueTasks,
  useMyTasks,
} from "@/hooks/useTask";
import { useNotifications } from "@/hooks/useNotification";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Bell,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  ListTodo,
  LogOut,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import TaskList from "@/components/task/TaskList";
import { Task } from "@/types/task";
import { Notification } from "@/types/notification";

const NOTIFICATION_LIMIT = 5;

export default function Dashboard() {
  const router = useRouter();
  const [notificationPage, setNotificationPage] = useState(1);

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const { data: todayTasks, isLoading: isTodayLoading } = useTodayTasks();
  const { data: upcomingTasks, isLoading: isUpcomingLoading } =
    useUpcomingTasks();
  const { data: overdueTasks, isLoading: isOverdueLoading } = useOverdueTasks();
  const { data: myTasks, isLoading: isMyTasksLoading } = useMyTasks();

  const {
    notifications,
    pagination,
    isLoading: isNotificationsLoading,
  } = useNotifications({ page: notificationPage, limit: NOTIFICATION_LIMIT });

  const notificationsList: Notification[] = useMemo(() => {
    return notifications || [];
  }, [notifications]);

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

  const todayCount = todayTasks?.length ?? 0;
  const upcomingCount = upcomingTasks?.length ?? 0;
  const overdueCount = overdueTasks?.length ?? 0;
  const totalCount = myTasks?.length ?? 0;

  const completedTasksByDate = useMemo(() => {
    if (!myTasks) return [];

    const dateCounts: Record<string, number> = {};

    myTasks.forEach((task: Task) => {
      const isCompleted = task.status === "COMPLETED";

      if (isCompleted) {
        const dateStr = task.updatedAt || task.createdAt;
        if (dateStr) {
          const formattedDate = new Date(dateStr).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          });
          dateCounts[formattedDate] = (dateCounts[formattedDate] || 0) + 1;
        }
      }
    });

    return Object.entries(dateCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => {
        const [dayA, monthA] = a.date.split("/").map(Number);
        const [dayB, monthB] = b.date.split("/").map(Number);
        return (
          new Date(2026, monthA - 1, dayA).getTime() -
          new Date(2026, monthB - 1, dayB).getTime()
        );
      });
  }, [myTasks]);

  if (isUserLoading) {
    return (
      <div className=" flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="ml-14 max-w-full p-6 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Ready to conquer the day, {user.name}! 👋
          </h1>
        </div>

        <Button
          variant="destructive"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? "Log out..." : "Logout"}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total tasks
            </CardTitle>
            <ListTodo className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isMyTasksLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                totalCount
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">Personal tasks</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">
              Today
            </CardTitle>
            <Clock className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isTodayLoading ? <Skeleton className="h-8 w-16" /> : todayCount}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Needs to be completed today
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">
              Upcoming
            </CardTitle>
            <CalendarIcon className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isUpcomingLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                upcomingCount
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">Upcoming tasks</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">
              Overdue
            </CardTitle>
            <AlertCircle className="h-5 w-5 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {isOverdueLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                overdueCount
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Requires Immediate Attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-200/60 p-1">
              <TabsTrigger value="today">Today({todayCount})</TabsTrigger>
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingCount})
              </TabsTrigger>
              <TabsTrigger value="overdue" className="text-rose-600">
                OverDue ({overdueCount})
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
          <Card className="flex flex-col justify-between">
            <div>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Bell className="h-5 w-5 text-indigo-500" /> Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isNotificationsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : notificationsList.length > 0 ? (
                  notificationsList.map((item: Notification, idx: number) => (
                    <div
                      key={item.id || idx}
                      className="p-3 bg-slate-100 rounded-lg text-sm space-y-1"
                    >
                      <p className="font-semibold text-slate-900 leading-snug">
                        {item.title}
                      </p>
                      <p className="text-slate-600 leading-relaxed break-words">
                        {item.content}
                      </p>
                      {item.createdAt && (
                        <span className="text-xs text-slate-400 block">
                          {new Date(item.createdAt).toLocaleString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 py-4 text-center">
                    No new notifications.
                  </p>
                )}
              </CardContent>
            </div>

            {totalNotificationPages > 1 && (
              <div className="flex items-center justify-between p-4 pt-0 border-t border-slate-100 mt-2">
                <span className="text-xs text-slate-500">
                  Page {notificationPage} / {totalNotificationPages}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setNotificationPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={notificationPage === 1 || isNotificationsLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setNotificationPage((prev) =>
                        Math.min(prev + 1, totalNotificationPages),
                      )
                    }
                    disabled={
                      notificationPage >= totalNotificationPages ||
                      isNotificationsLoading
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Completion Progress
              </CardTitle>
              <CardDescription>
                Number of completed tasks by day
              </CardDescription>
            </CardHeader>
            <CardContent className="h-52 pt-0">
              {completedTasksByDate.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={completedTasksByDate}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#10b981" }}
                      activeDot={{ r: 6 }}
                      name="Tasks completed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No completed tasks yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
