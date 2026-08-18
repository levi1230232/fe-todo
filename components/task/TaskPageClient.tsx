"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Tag as TagIcon,
  Users,
  X,
  PanelRightOpen,
  Search,
  Filter,
  Calendar,
  Folder,
  Trash2,
} from "lucide-react";

import {
  useLeaveTeam,
  useTeam,
  useTeamMemberMutations,
  useTeamMembers,
} from "@/hooks/useTeam";
import { useUser } from "@/hooks/useAuth";
import { useTeamPermission } from "@/hooks/useTeamPermission";
import { UserService } from "@/services/user.service";
import { TeamMemberManager } from "@/components/TeamMember/TeamMemberManager";
import { useCategory } from "@/hooks/useCategories";
import { useGetPersonalTags, useGetTeamTags } from "@/hooks/useTag";
import { toast } from "sonner";
import { TagManager } from "@/components/tag/TagManager";
import KanbanBoard from "./kanban/KanbanBoard";
import { TeamMember } from "@/types/team";
import { Tag } from "@/types/task";

export default function TaskPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const teamIdParam = searchParams.get("teamId");
  const teamId = teamIdParam ? Number(teamIdParam) : 0;
  const hasTeam = Boolean(teamId > 0);

  const categoryIdParam = searchParams.get("categoryId");
  const categoryId = categoryIdParam ? Number(categoryIdParam) : 0;
  const hasCategory = Boolean(categoryId > 0);

  const { data: currentUser } = useUser();
  const { data: category } = useCategory(hasCategory ? categoryId : undefined);
  const { data: team } = useTeam(hasTeam ? teamId : undefined);
  const { data: members = [], isLoading: isLoadingMembers } =
    useTeamMembers(teamId);
  const { data: tagPersonal = [] } = useGetPersonalTags();
  const { data: tagTeam = [] } = useGetTeamTags(teamId);
  const { mutateAsync: leaveTeam } = useLeaveTeam();
  const { addMember, removeMember, updateRole } =
    useTeamMemberMutations(teamId);

  const permissions = useTeamPermission(currentUser, members);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"members" | "tags">(
    hasTeam ? "members" : "tags",
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [filterText, setFilterText] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedAssignee, setSelectedAssignee] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");

  const [dueDateFilterType, setDueDateFilterType] = useState<
    "all" | "today" | "this_week" | "overdue" | "custom"
  >("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilterText(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const memoizedFilters = useMemo(
    () => ({
      search: filterText,
      tag: selectedTag,
      assignee: selectedAssignee,
      priority: selectedPriority,
      dueDateType: dueDateFilterType,
      startDate,
      endDate,
    }),
    [
      filterText,
      selectedTag,
      selectedAssignee,
      selectedPriority,
      dueDateFilterType,
      startDate,
      endDate,
    ],
  );

  const handleRemoveMember = async (memberId: number) => {
    try {
      const res = await removeMember(memberId);
      toast.success(res.data.message);
    } catch (error: any) {
      toast.error(error?.response?.data?.message);
    }
  };

  const handleChangeRole = async (memberId: number, newRole: string) => {
    try {
      await updateRole({ memberId, role: newRole });
    } catch (error: any) {
      toast.error(error?.response?.data?.message);
    }
  };

  const renderHeaderTitle = () => {
    const categoryName =
      category?.name || (hasCategory ? `Category #${categoryId}` : "");
    const teamName = team?.name || (hasTeam ? `Team #${teamId}` : "");

    if (hasTeam && hasCategory) return `${teamName} • ${categoryName}`;
    if (hasTeam) return teamName;
    if (hasCategory) return categoryName;
  };

  const handleLeaveTeam = async () => {
    try {
      const res = await leaveTeam(teamId);
      toast.success(res.data.message);
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error?.response?.data?.message);
    }
  };

  const renderHeaderDescription = () => {
    const categoryDesc = category?.description;
    const teamDesc = team?.description;

    if (hasTeam && hasCategory) {
      if (teamDesc && categoryDesc) return `${teamDesc} | ${categoryDesc}`;
      return (
        teamDesc ||
        categoryDesc ||
        "Manage group tasks by category, labels, and members"
      );
    }
    if (hasTeam) return teamDesc || "Manage team tasks, labels, and members";
    if (hasCategory)
      return categoryDesc || "Manage personal tasks in this category";
    return "Manage personal tasks and labels.";
  };

  const trashUrl = `/tasks/trash?${new URLSearchParams({
    ...(hasTeam ? { teamId: String(teamId) } : {}),
    ...(hasCategory ? { categoryId: String(categoryId) } : {}),
  }).toString()}`;

  return (
    <div className="ml-0 md:ml-14 flex h-screen bg-slate-50 overflow-hidden relative">
      <div className="flex-1 flex flex-col min-w-0 overflow-x-auto transition-all duration-300">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-800">
                {renderHeaderTitle()}
              </h1>

              {hasCategory && category && (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition"
                  style={{
                    backgroundColor: category.color
                      ? `${category.color}15`
                      : "#EFF6FF",
                    color: category.color || "#1D4ED8",
                    borderColor: category.color
                      ? `${category.color}30`
                      : "#DBEAFE",
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: category.color || "#3B82F6" }}
                  />
                  <Folder size={12} />
                  {category.name}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-1">
              {renderHeaderDescription()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={trashUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 hover:bg-slate-200 border border-slate-300 rounded-lg shadow-sm transition"
              title="View Trash Tasks"
            >
              <Trash2 size={15} />
              <span>Trash Tasks</span>
            </Link>
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition"
              >
                <PanelRightOpen size={16} className="text-blue-600" />
                <span>{hasTeam ? "Manage Team & Tag" : "Manage Tag"}</span>
              </button>
            )}
          </div>
        </header>

        <section className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by task name..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Filter size={13} /> Filter:
            </span>

            {hasTeam && (
              <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                <Users size={13} className="text-slate-400" />
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="text-xs bg-transparent text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">All members</option>
                  <option value="unassigned">Unassign</option>
                  {members.map((m: TeamMember) => (
                    <option key={m.id} value={m.user.id}>
                      {m.user.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
              <Calendar size={13} className="text-slate-400" />
              <select
                value={dueDateFilterType}
                onChange={(e) => setDueDateFilterType(e.target.value as any)}
                className="text-xs bg-transparent text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All due dates</option>
                <option value="today">Today</option>
                <option value="this_week">7 days</option>
                <option value="overdue">Overdue</option>
                <option value="custom">Custom date range...</option>
              </select>
            </div>

            {dueDateFilterType === "custom" && (
              <div className="flex items-center gap-1">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-400">-</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All tags</option>
              {!hasTeam ? (
                <>
                  {tagPersonal.map((tag: Tag) => (
                    <option key={`personal-${tag.id}`} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </>
              ) : (
                <>
                  {tagTeam.map((tag: Tag) => (
                    <option key={`team-${tag.id}`} value={tag.name}>
                      {tag.name}
                    </option>
                  ))}
                </>
              )}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </section>

        <main className="flex-1 p-6 overflow-y-auto">
          <KanbanBoard
            teamId={hasTeam ? teamId : null}
            filters={memoizedFilters}
          />
        </main>
      </div>

      <aside
        className={`fixed top-0 right-0 h-full w-80 bg-white border-l border-slate-200 shadow-xl z-40 transition-transform duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex bg-slate-200/60 p-1 rounded-lg gap-1">
            {hasTeam && (
              <button
                onClick={() => setActiveTab("members")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition ${
                  activeTab === "members"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Users size={14} />
                <span>Members ({members.length})</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("tags")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition ${
                activeTab === "tags"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <TagIcon size={14} />
              <span>Tags</span>
            </button>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-md transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {hasTeam && activeTab === "members" && (
            <TeamMemberManager
              members={members}
              teamId={teamId}
              canManage={permissions.role === "OWNER"}
              isOwner={permissions.role === "OWNER"}
              isMemberOfTeam={Boolean(permissions.role)}
              onLeaveTeam={handleLeaveTeam}
              isLoading={isLoadingMembers}
              onSearchUserByEmail={async (email) => {
                try {
                  const res = await UserService.getUserByEmail(email);
                  const userData = res?.data?.data || res?.data;
                  if (!userData || !userData.id) {
                    return null;
                  }
                  return userData;
                } catch (error: any) {
                  toast.error(error?.response?.data?.message);
                  return null;
                }
              }}
              onAddMember={async (searchedUser) => {
                await addMember(Number(searchedUser.id));
              }}
              onRemoveMember={handleRemoveMember}
              changeRole={handleChangeRole}
            />
          )}

          {activeTab === "tags" && (
            <TagManager canManage={!hasTeam || permissions.isAdminOrOwner} />
          )}
        </div>
      </aside>
    </div>
  );
}
