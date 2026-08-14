"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ListTodo,
  Clock,
  Calendar as CalendarIcon,
  AlertCircle,
} from "lucide-react";

interface DashboardStatsProps {
  totalCount: number;
  todayCount: number;
  upcomingCount: number;
  overdueCount: number;
  isMyTasksLoading: boolean;
  isTodayLoading: boolean;
  isUpcomingLoading: boolean;
  isOverdueLoading: boolean;
}

export function DashboardStats({
  totalCount,
  todayCount,
  upcomingCount,
  overdueCount,
  isMyTasksLoading,
  isTodayLoading,
  isUpcomingLoading,
  isOverdueLoading,
}: DashboardStatsProps) {
  return (
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
            {isMyTasksLoading ? <Skeleton className="h-8 w-16" /> : totalCount}
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
  );
}
