"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import {
  Users,
  Plus,
  ChevronRight,
  Trash2,
  Pencil,
  Home,
  LayoutDashboard,
} from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "../ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

import { useState } from "react";
import { CategoryOutput } from "@/schemas/category.schema";
import { TeamOutput } from "@/schemas/team.schema";

import CategoryFormModal from "../category/CategoryFormModal";
import DeleteCategoryModal from "../category/DeleteCategoryModal";
import DeleteTeamModal from "../team/DeleteTeamModal";

import { useCategories } from "@/hooks/useCategories";
import { useTeams } from "@/hooks/useTeam";
import TeamFormModal from "./../team/TeamFormModal";
import { toast } from "sonner";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentWorkspaceStyle = searchParams.get("workspaceStyle");
  const currentCategoryId = searchParams.get("categoryId");
  const currentTeamId = searchParams.get("teamId");

  const {
    categories,
    deleteCategory,
    isDeleting: isDeletingCategory,
  } = useCategories();

  const { teams, deleteTeam, isDeleting: isDeletingTeam } = useTeams();

  const [isPersonalOpen, setIsPersonalOpen] = useState(true);
  const [isTeamOpen, setIsTeamOpen] = useState(true);

  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [openDeleteCategoryModal, setOpenDeleteCategoryModal] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<
    (CategoryOutput & { id: number }) | null
  >(null);
  const [editingCategory, setEditingCategory] = useState<
    (Partial<CategoryOutput> & { id?: number }) | null
  >(null);

  const [openTeamModal, setOpenTeamModal] = useState(false);
  const [openDeleteTeamModal, setOpenDeleteTeamModal] = useState(false);
  const [deletingTeam, setDeletingTeam] = useState<
    (TeamOutput & { id: number }) | null
  >(null);
  const [editingTeam, setEditingTeam] = useState<
    (Partial<TeamOutput> & { id?: number }) | null
  >(null);

  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setOpenCategoryModal(true);
  };

  const handleOpenEditCategory = (
    category: CategoryOutput & { id: number },
  ) => {
    setEditingCategory(category);
    setOpenCategoryModal(true);
  };

  const handleDeleteCategory = (category: CategoryOutput & { id: number }) => {
    setDeletingCategory(category);
    setOpenDeleteCategoryModal(true);
  };

  const confirmDeleteCategory = async () => {
    if (!deletingCategory) return;
    try {
      const res = await deleteCategory(deletingCategory.id);
      setOpenDeleteCategoryModal(false);
      setDeletingCategory(null);
      toast.success(res.data.message);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("An error occurred while deleting the category:", error);
      toast.error(error.response?.data?.message);
    }
  };

  const handleCategorySuccess = (
    newCategory?: CategoryOutput & { id: number },
  ) => {
    if (!editingCategory && newCategory?.id) {
      router.push(
        `/tasks?workspaceStyle=PERSONAL&categoryId=${newCategory.id}`,
      );
    }
    setOpenCategoryModal(false);
  };

  const handleOpenCreateTeam = () => {
    setEditingTeam(null);
    setOpenTeamModal(true);
  };

  const handleOpenEditTeam = (team: TeamOutput & { id: number }) => {
    setEditingTeam(team);
    setOpenTeamModal(true);
  };

  const handleDeleteTeam = (team: TeamOutput & { id: number }) => {
    setDeletingTeam(team);
    setOpenDeleteTeamModal(true);
  };

  const confirmDeleteTeam = async () => {
    if (!deletingTeam) return;
    try {
      const res = await deleteTeam(deletingTeam.id);
      setOpenDeleteTeamModal(false);
      setDeletingTeam(null);
      toast.success(res.data.message);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Lỗi khi xóa team:", error);
      toast.error(error.response?.data?.message);
    }
  };

  const handleTeamSuccess = (newTeam?: TeamOutput & { id: number }) => {
    if (!editingTeam && newTeam?.id) {
      router.push(`/tasks?workspaceStyle=TEAM&teamId=${newTeam.id}`);
    }
    setOpenTeamModal(false);
  };

  const isDashboardActive = pathname === "/dashboard";

  return (
    <aside className="fixed top-0 group/sidebar shadow flex h-screen w-16 hover:w-72 flex-col border-r bg-white text-slate-700 transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden z-50">
      <div className="flex h-16 shrink-0 items-center px-3 border-b">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-md shadow-indigo-600/20">
          T
        </div>

        <Link
          href="/dashboard"
          className="ml-3 flex flex-col whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100"
        >
          <h1 className="text-base font-bold leading-tight text-slate-900">
            Todo App
          </h1>
          <p className="text-xs text-slate-400">Manage your work</p>
        </Link>
      </div>

      <div className="p-3">
        <p className="hidden group-hover/sidebar:block mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Main
        </p>

        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              href="/dashboard"
              className={`flex h-10 w-full items-center rounded-xl transition-colors ${
                isDashboardActive
                  ? "bg-indigo-50 text-indigo-600 font-semibold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                <LayoutDashboard
                  className={`h-5 w-5 ${
                    isDashboardActive ? "text-indigo-600" : "text-slate-500"
                  }`}
                />
              </div>
              <span className="whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100">
                Dashboard
              </span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>

      <SidebarGroup className="p-3 pt-0">
        <SidebarGroupLabel className="hidden group-hover/sidebar:block px-2 mb-1 text-xs uppercase tracking-wide text-slate-400">
          Workspace
        </SidebarGroupLabel>

        <SidebarGroupContent>
          <SidebarMenu className="space-y-1">
            <Collapsible
              open={isPersonalOpen}
              onOpenChange={setIsPersonalOpen}
              className="w-full"
            >
              <SidebarMenuItem className="w-full">
                <CollapsibleTrigger className="flex h-10 w-full items-center rounded-xl transition-colors hover:bg-slate-100">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                    <Home className="h-5 w-5 text-slate-500" />
                  </div>
                  <span className="whitespace-nowrap font-medium opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100">
                    Personal
                  </span>
                  <ChevronRight
                    className={`ml-auto mr-2 h-4 w-4 shrink-0 transition-transform duration-200 opacity-0 group-hover/sidebar:opacity-100 ${
                      isPersonalOpen ? "rotate-90" : ""
                    }`}
                  />
                </CollapsibleTrigger>

                <CollapsibleContent className="hidden group-hover/sidebar:block">
                  <SidebarMenu className="ml-3 mt-1 space-y-1 border-l pl-2">
                    {categories.map(
                      (category: CategoryOutput & { id: number }) => {
                        const isActive =
                          pathname === "/tasks" &&
                          currentWorkspaceStyle === "PERSONAL" &&
                          currentCategoryId === String(category.id);

                        return (
                          <SidebarMenuItem key={category.id}>
                            <div
                              className={`group flex w-full items-center rounded-lg px-2 py-1.5 transition-colors ${
                                isActive
                                  ? "bg-indigo-50 font-medium text-indigo-600"
                                  : "hover:bg-slate-100 text-slate-700"
                              }`}
                            >
                              <Link
                                href={`/tasks?workspaceStyle=PERSONAL&categoryId=${category.id}`}
                                className="flex flex-1 items-center gap-2.5 text-sm overflow-hidden"
                              >
                                <span
                                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                                  style={{
                                    backgroundColor:
                                      category.color || "#6366f1",
                                  }}
                                />
                                <span className="truncate">
                                  {category.name}
                                </span>
                              </Link>

                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenEditCategory(category)
                                  }
                                  className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-indigo-600"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteCategory(category)}
                                  className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-rose-500"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </SidebarMenuItem>
                        );
                      },
                    )}

                    <SidebarMenuItem>
                      <button
                        type="button"
                        onClick={handleOpenCreateCategory}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-400 transition-colors hover:bg-slate-50 hover:text-indigo-600"
                      >
                        <Plus className="h-4 w-4 shrink-0" />
                        <span className="whitespace-nowrap">Add Category</span>
                      </button>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>

            <Collapsible
              open={isTeamOpen}
              onOpenChange={setIsTeamOpen}
              className="w-full"
            >
              <SidebarMenuItem className="w-full">
                <CollapsibleTrigger className="flex h-10 w-full items-center rounded-xl transition-colors hover:bg-slate-100">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                    <Users className="h-5 w-5 text-slate-500" />
                  </div>
                  <span className="whitespace-nowrap font-medium opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100">
                    Team
                  </span>
                  <ChevronRight
                    className={`ml-auto mr-2 h-4 w-4 shrink-0 transition-transform duration-200 opacity-0 group-hover/sidebar:opacity-100 ${
                      isTeamOpen ? "rotate-90" : ""
                    }`}
                  />
                </CollapsibleTrigger>

                <CollapsibleContent className="hidden group-hover/sidebar:block">
                  <SidebarMenu className="ml-3 mt-1 space-y-1 border-l pl-2">
                    {teams.map((team: TeamOutput & { id: number }) => {
                      const isActive =
                        pathname === "/tasks" &&
                        currentWorkspaceStyle === "TEAM" &&
                        currentTeamId === String(team.id);

                      return (
                        <SidebarMenuItem key={team.id}>
                          <div
                            className={`group flex w-full items-center rounded-lg px-2 py-1.5 transition-colors ${
                              isActive
                                ? "bg-indigo-50 font-medium text-indigo-600"
                                : "hover:bg-slate-100 text-slate-700"
                            }`}
                          >
                            <Link
                              href={`/tasks?workspaceStyle=TEAM&teamId=${team.id}`}
                              className="flex flex-1 items-center gap-2.5 text-sm overflow-hidden"
                            >
                              <div
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold ${
                                  isActive
                                    ? "bg-indigo-600 text-white"
                                    : "bg-indigo-100 text-indigo-600"
                                }`}
                              >
                                {team.name?.[0]?.toUpperCase() || "T"}
                              </div>
                              <span className="truncate">{team.name}</span>
                            </Link>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleOpenEditTeam(team)}
                                className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-indigo-600"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteTeam(team)}
                                className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-rose-500"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </SidebarMenuItem>
                      );
                    })}

                    <SidebarMenuItem>
                      <button
                        type="button"
                        onClick={handleOpenCreateTeam}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-400 transition-colors hover:bg-slate-50 hover:text-indigo-600"
                      >
                        <Plus className="h-4 w-4 shrink-0" />
                        <span className="whitespace-nowrap">Create Team</span>
                      </button>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <CategoryFormModal
        open={openCategoryModal}
        editingCategory={editingCategory}
        onClose={() => setOpenCategoryModal(false)}
        onSuccess={handleCategorySuccess}
      />

      <DeleteCategoryModal
        open={openDeleteCategoryModal}
        category={deletingCategory}
        isDeleting={isDeletingCategory}
        onClose={() => {
          setOpenDeleteCategoryModal(false);
          setDeletingCategory(null);
        }}
        onConfirm={confirmDeleteCategory}
      />

      <TeamFormModal
        open={openTeamModal}
        editingTeam={editingTeam}
        onClose={() => setOpenTeamModal(false)}
        onSuccess={handleTeamSuccess}
      />

      <DeleteTeamModal
        open={openDeleteTeamModal}
        team={deletingTeam}
        isDeleting={isDeletingTeam}
        onClose={() => {
          setOpenDeleteTeamModal(false);
          setDeletingTeam(null);
        }}
        onConfirm={confirmDeleteTeam}
      />
    </aside>
  );
}
