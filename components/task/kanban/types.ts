import { FilterState } from "@/lib/taskFilters";
import { TaskStatus } from "@/types/task";

export interface KanbanBoardProps {
  teamId?: number | null;
  filters?: FilterState;
}

export const COLUMNS: {
  id: TaskStatus;
  title: string;
  color: string;
  badgeColor: string;
}[] = [
  {
    id: TaskStatus.PENDING,
    title: "Pending",
    color: "border-slate-300 bg-slate-50/70",
    badgeColor: "bg-slate-200 text-slate-700",
  },
  {
    id: TaskStatus.IN_PROGRESS,
    title: "In progress",
    color: "border-blue-300 bg-blue-50/40",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    id: TaskStatus.REVIEW,
    title: "Review",
    color: "border-purple-300 bg-purple-50/40",
    badgeColor: "bg-purple-100 text-purple-700",
  },
  {
    id: TaskStatus.COMPLETED,
    title: "Completed",
    color: "border-emerald-300 bg-emerald-50/40",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
];
