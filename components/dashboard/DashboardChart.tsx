"use client";

import { useMemo } from "react";
import {
  format,
  subMonths,
  isWithinInterval,
  parseISO,
  isValid,
} from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Task } from "@/types/task";

interface DashboardChartProps {
  tasks?: Task[];
}

export function DashboardChart({ tasks }: DashboardChartProps) {
  const completedTasksByDate = useMemo(() => {
    if (!tasks) return [];

    const now = new Date();
    const oneMonthAgo = subMonths(now, 1);
    const dateCounts: Record<string, { count: number; rawDate: Date }> = {};

    tasks.forEach((task) => {
      if (task.status !== "COMPLETED") return;

      const dateStr = task.updatedAt || task.createdAt;
      if (!dateStr) return;

      const taskDate =
        typeof dateStr === "string" ? parseISO(dateStr) : new Date(dateStr);
      if (!isValid(taskDate)) return;
      if (!isWithinInterval(taskDate, { start: oneMonthAgo, end: now })) return;
      const formattedDate = format(taskDate, "dd/MM");

      if (!dateCounts[formattedDate]) {
        dateCounts[formattedDate] = { count: 0, rawDate: taskDate };
      }
      dateCounts[formattedDate].count++;
    });

    return Object.entries(dateCounts)
      .map(([date, { count, rawDate }]) => ({ date, count, rawDate }))
      .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())
      .map(({ date, count }) => ({ date, count }));
  }, [tasks]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-500" />
          Completion Progress
        </CardTitle>
        <CardDescription>Number of completed tasks by day</CardDescription>
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
  );
}
