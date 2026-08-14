import {
  endOfDay,
  endOfWeek,
  isBefore,
  isSameDay,
  isWithinInterval,
  startOfDay,
  startOfWeek,
} from "date-fns";

import { Task, TaskStatus } from "@/types/task";

export type DueDateType = "all" | "today" | "this_week" | "overdue" | "custom";

export interface FilterState {
  search?: string;
  priority?: string;
  assignee?: string;
  tag?: string;

  dueDateType?: DueDateType;

  startDate?: string | Date;
  endDate?: string | Date;
}

export function filterTasks(
  tasks: Task[],
  filters: FilterState | undefined,
  isTeamWorkspace: boolean,
): Task[] {
  if (!filters) {
    return tasks;
  }

  const { search, priority, assignee, tag, dueDateType, startDate, endDate } =
    filters;

  return tasks.filter((task) => {
    if (search?.trim()) {
      const keyword = search.trim().toLowerCase();

      const title = task.title?.toLowerCase() ?? "";

      const description = task.description?.toLowerCase() ?? "";

      const matchesSearch =
        title.includes(keyword) || description.includes(keyword);

      if (!matchesSearch) {
        return false;
      }
    }

    if (priority && priority !== "all" && task.priority !== priority) {
      return false;
    }

    if (isTeamWorkspace && assignee && assignee !== "all") {
      if (assignee === "unassigned") {
        if (task.assignedTo !== null && task.assignedTo !== undefined) {
          return false;
        }
      } else {
        if (String(task.assignedTo) !== assignee) {
          return false;
        }
      }
    }

    if (tag && tag !== "all") {
      const hasTag =
        task.taskTags?.some(
          ({ tag: taskTag }) =>
            taskTag.name.toLowerCase() === tag.toLowerCase(),
        ) ?? false;

      if (!hasTag) {
        return false;
      }
    }

    if (dueDateType && dueDateType !== "all") {
      if (!task.dueTo) {
        return false;
      }

      const taskDate = new Date(task.dueTo);

      if (Number.isNaN(taskDate.getTime())) {
        return false;
      }

      const now = new Date();

      if (dueDateType === "today") {
        if (!isSameDay(taskDate, now)) {
          return false;
        }
      } else if (dueDateType === "this_week") {
        const interval = {
          start: startOfWeek(now, {
            weekStartsOn: 1,
          }),
          end: endOfWeek(now, {
            weekStartsOn: 1,
          }),
        };

        if (!isWithinInterval(taskDate, interval)) {
          return false;
        }
      } else if (dueDateType === "overdue") {
        if (task.status === TaskStatus.COMPLETED) {
          return false;
        }

        if (!isBefore(taskDate, now)) {
          return false;
        }
      } else if (dueDateType === "custom") {
        if (!startDate || !endDate) {
          return false;
        }

        const start = new Date(startDate);

        const end = new Date(endDate);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
          return false;
        }

        const interval = {
          start: startOfDay(start),
          end: endOfDay(end),
        };

        if (!isWithinInterval(taskDate, interval)) {
          return false;
        }
      }
    }

    return true;
  });
}

export function groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const initialMap: Record<TaskStatus, Task[]> = {
    [TaskStatus.PENDING]: [],
    [TaskStatus.IN_PROGRESS]: [],
    [TaskStatus.REVIEW]: [],
    [TaskStatus.COMPLETED]: [],
  };

  return tasks.reduce((acc, task) => {
    if (acc[task.status]) {
      acc[task.status].push(task);
    }

    return acc;
  }, initialMap);
}
