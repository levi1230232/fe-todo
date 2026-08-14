import { addDays, formatISO, startOfWeek, subDays } from "date-fns";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Priority, TaskStatus, WorkspaceStyle, type Task } from "@/types/task";

import {
  filterTasks,
  groupTasksByStatus,
  type FilterState,
} from "./taskFilters";

const MOCK_NOW = new Date("2026-08-13T10:00:00.000Z");

const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: 1,
  title: "Test Task",

  priority: Priority.HIGH,
  status: TaskStatus.PENDING,

  dueTo: MOCK_NOW.toISOString(),

  workspaceStyle: WorkspaceStyle.PERSONAL,

  createBy: 100,
  assignedTo: 101,

  isSoftDelete: false,

  createdAt: MOCK_NOW.toISOString(),
  updatedAt: MOCK_NOW.toISOString(),

  taskTags: [
    {
      tag: {
        id: 10,
        name: "Frontend",
        color: "#ffffff",
      },
    },
  ],

  ...overrides,
});

describe("filterTasks", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const sampleTasks: Task[] = [
    createMockTask({
      id: 1,
      title: "Fix bug in login",
      priority: Priority.HIGH,
      assignedTo: 101,
      status: TaskStatus.PENDING,
      dueTo: MOCK_NOW.toISOString(),

      taskTags: [
        {
          tag: {
            id: 1,
            name: "Bug",
            color: "#ff0000",
          },
        },
      ],
    }),

    createMockTask({
      id: 2,
      title: "Write documentation",
      priority: Priority.LOW,
      assignedTo: null,
      status: TaskStatus.COMPLETED,
      dueTo: subDays(MOCK_NOW, 2).toISOString(),

      taskTags: [
        {
          tag: {
            id: 2,
            name: "Docs",
            color: "#00ff00",
          },
        },
      ],
    }),

    createMockTask({
      id: 3,
      title: "Design landing page",
      priority: Priority.MEDIUM,
      assignedTo: 102,
      status: TaskStatus.IN_PROGRESS,
      dueTo: addDays(MOCK_NOW, 10).toISOString(),

      taskTags: [
        {
          tag: {
            id: 3,
            name: "UI",
            color: "#0000ff",
          },
        },
        {
          tag: {
            id: 4,
            name: "Frontend",
            color: "#ffffff",
          },
        },
      ],
    }),
  ];

  describe("Basic filtering", () => {
    it("should return all tasks when filters are undefined", () => {
      const result = filterTasks(sampleTasks, undefined, false);

      expect(result).toHaveLength(3);
      expect(result).toEqual(sampleTasks);
    });

    it("should return all tasks when filters are empty", () => {
      const filters: FilterState = {};

      const result = filterTasks(sampleTasks, filters, false);

      expect(result).toHaveLength(3);
      expect(result).toEqual(sampleTasks);
    });
  });

  describe("Search filtering", () => {
    it("should filter tasks by search keyword", () => {
      const filters: FilterState = {
        search: "BUG",
      };

      const result = filterTasks(sampleTasks, filters, false);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it("should search case-insensitively", () => {
      const filters: FilterState = {
        search: "design LANDING",
      };

      const result = filterTasks(sampleTasks, filters, false);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(3);
    });

    it("should return empty array when search does not match", () => {
      const filters: FilterState = {
        search: "non-existent-task",
      };

      const result = filterTasks(sampleTasks, filters, false);

      expect(result).toHaveLength(0);
    });

    it("should search by description", () => {
      const task = createMockTask({
        id: 99,
        title: "Some task",
        description: "Fix authentication issue",
      });

      const filters: FilterState = {
        search: "AUTHENTICATION",
      };

      const result = filterTasks([task], filters, false);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(99);
    });
  });

  describe("Priority filtering", () => {
    it("should filter tasks by high priority", () => {
      const filters: FilterState = {
        priority: Priority.HIGH,
      };

      const result = filterTasks(sampleTasks, filters, false);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it("should filter tasks by medium priority", () => {
      const filters: FilterState = {
        priority: Priority.MEDIUM,
      };

      const result = filterTasks(sampleTasks, filters, false);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(3);
    });

    it("should filter tasks by low priority", () => {
      const filters: FilterState = {
        priority: Priority.LOW,
      };

      const result = filterTasks(sampleTasks, filters, false);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });

    it("should ignore priority filter when set to all", () => {
      const filters: FilterState = {
        priority: "all",
      };

      const result = filterTasks(sampleTasks, filters, false);

      expect(result).toHaveLength(3);
    });
  });

  describe("Assignee filtering", () => {
    it("should filter by assigned user ID in team workspace", () => {
      const filters: FilterState = {
        assignee: "102",
      };

      const result = filterTasks(sampleTasks, filters, true);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(3);
    });

    it("should filter unassigned tasks in team workspace", () => {
      const filters: FilterState = {
        assignee: "unassigned",
      };

      const result = filterTasks(sampleTasks, filters, true);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });

    it("should ignore assignee filter in personal workspace", () => {
      const filters: FilterState = {
        assignee: "102",
      };

      const result = filterTasks(sampleTasks, filters, false);

      expect(result).toHaveLength(3);
    });

    it("should ignore assignee filter when set to all", () => {
      const filters: FilterState = {
        assignee: "all",
      };

      const result = filterTasks(sampleTasks, filters, true);

      expect(result).toHaveLength(3);
    });
  });

  describe("Tag filtering", () => {
    it("should filter tasks containing matching tag", () => {
      const filters: FilterState = {
        tag: "frontend",
      };

      const result = filterTasks(sampleTasks, filters, false);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(3);
    });

    it("should filter tags case-insensitively", () => {
      const filters: FilterState = {
        tag: "FRONTEND",
      };

      const result = filterTasks(sampleTasks, filters, false);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(3);
    });

    it("should ignore tag filter when set to all", () => {
      const filters: FilterState = {
        tag: "all",
      };

      const result = filterTasks(sampleTasks, filters, false);

      expect(result).toHaveLength(3);
    });

    it("should return empty array when tag does not exist", () => {
      const filters: FilterState = {
        tag: "backend",
      };

      const result = filterTasks(sampleTasks, filters, false);

      expect(result).toHaveLength(0);
    });
  });

  describe("Due date filtering", () => {
    it("should filter tasks due today", () => {
      const filters: FilterState = {
        dueDateType: "today",
      };

      const result = filterTasks(sampleTasks, filters, false);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it("should filter tasks due this week", () => {
      const thisWeekStart = startOfWeek(MOCK_NOW, {
        weekStartsOn: 1,
      });

      const taskThisWeek = createMockTask({
        id: 4,
        dueTo: addDays(thisWeekStart, 1).toISOString(),
      });

      const filters: FilterState = {
        dueDateType: "this_week",
      };

      const result = filterTasks(
        [...sampleTasks, taskThisWeek],
        filters,
        false,
      );

      expect(result.some((task) => task.id === 4)).toBe(true);
    });

    it("should not include tasks outside this week", () => {
      const nextWeekTask = createMockTask({
        id: 5,
        dueTo: addDays(MOCK_NOW, 10).toISOString(),
      });

      const filters: FilterState = {
        dueDateType: "this_week",
      };

      const result = filterTasks(
        [...sampleTasks, nextWeekTask],
        filters,
        false,
      );

      expect(result.some((task) => task.id === 5)).toBe(false);
    });

    it("should filter overdue tasks", () => {
      const overdueTask = createMockTask({
        id: 99,
        status: TaskStatus.PENDING,
        dueTo: subDays(MOCK_NOW, 3).toISOString(),
      });

      const filters: FilterState = {
        dueDateType: "overdue",
      };

      const result = filterTasks([...sampleTasks, overdueTask], filters, false);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(99);
    });

    it("should exclude completed overdue tasks", () => {
      const overdueCompletedTask = createMockTask({
        id: 100,
        status: TaskStatus.COMPLETED,
        dueTo: subDays(MOCK_NOW, 3).toISOString(),
      });

      const filters: FilterState = {
        dueDateType: "overdue",
      };

      const result = filterTasks(
        [...sampleTasks, overdueCompletedTask],
        filters,
        false,
      );

      expect(result.some((task) => task.id === 100)).toBe(false);
    });

    it("should filter tasks within custom date range", () => {
      const startDate = subDays(MOCK_NOW, 5);

      const endDate = addDays(MOCK_NOW, 5);

      const filters: FilterState = {
        dueDateType: "custom",
        startDate: formatISO(startDate),
        endDate: formatISO(endDate),
      };

      const result = filterTasks(sampleTasks, filters, false);

      expect(result).toHaveLength(2);

      expect(result.map((task) => task.id)).toEqual([1, 2]);
    });

    it("should skip tasks without dueTo", () => {
      const taskWithoutDueDate = createMockTask({
        id: 88,
        dueTo: null,
      });

      const filters: FilterState = {
        dueDateType: "today",
      };

      const result = filterTasks([taskWithoutDueDate], filters, false);

      expect(result).toHaveLength(0);
    });

    it("should skip tasks without dueTo when filtering this week", () => {
      const taskWithoutDueDate = createMockTask({
        id: 89,
        dueTo: null,
      });

      const filters: FilterState = {
        dueDateType: "this_week",
      };

      const result = filterTasks([taskWithoutDueDate], filters, false);

      expect(result).toHaveLength(0);
    });

    it("should skip tasks without dueTo when filtering overdue", () => {
      const taskWithoutDueDate = createMockTask({
        id: 90,
        dueTo: null,
      });

      const filters: FilterState = {
        dueDateType: "overdue",
      };

      const result = filterTasks([taskWithoutDueDate], filters, false);

      expect(result).toHaveLength(0);
    });
  });
});

describe("groupTasksByStatus", () => {
  it("should correctly group tasks by status", () => {
    const tasks: Task[] = [
      createMockTask({
        id: 1,
        status: TaskStatus.PENDING,
      }),

      createMockTask({
        id: 2,
        status: TaskStatus.IN_PROGRESS,
      }),

      createMockTask({
        id: 3,
        status: TaskStatus.REVIEW,
      }),

      createMockTask({
        id: 4,
        status: TaskStatus.COMPLETED,
      }),

      createMockTask({
        id: 5,
        status: TaskStatus.PENDING,
      }),
    ];

    const grouped = groupTasksByStatus(tasks);

    expect(grouped[TaskStatus.PENDING]).toHaveLength(2);

    expect(grouped[TaskStatus.IN_PROGRESS]).toHaveLength(1);

    expect(grouped[TaskStatus.REVIEW]).toHaveLength(1);

    expect(grouped[TaskStatus.COMPLETED]).toHaveLength(1);
  });

  it("should return all status keys with empty arrays when input is empty", () => {
    const grouped = groupTasksByStatus([]);

    expect(grouped).toEqual({
      [TaskStatus.PENDING]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.REVIEW]: [],
      [TaskStatus.COMPLETED]: [],
    });
  });

  it("should preserve tasks inside their corresponding status groups", () => {
    const tasks: Task[] = [
      createMockTask({
        id: 1,
        status: TaskStatus.PENDING,
      }),

      createMockTask({
        id: 2,
        status: TaskStatus.PENDING,
      }),

      createMockTask({
        id: 3,
        status: TaskStatus.COMPLETED,
      }),
    ];

    const grouped = groupTasksByStatus(tasks);

    expect(grouped[TaskStatus.PENDING].map((task) => task.id)).toEqual([1, 2]);

    expect(grouped[TaskStatus.COMPLETED].map((task) => task.id)).toEqual([3]);
  });
});
