import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/services/category.service";
import { CategoryOutput } from "@/schemas/category.schema";

export const CATEGORY_KEYS = {
  all: ["categories"] as const,
  lists: () => [...CATEGORY_KEYS.all, "list"] as const,
  detail: (id: number) => [...CATEGORY_KEYS.all, "detail", id] as const,
};

export function useCategory(id?: number) {
  return useQuery({
    queryKey: CATEGORY_KEYS.detail(id!),
    queryFn: async () => {
      const res = await categoryService.getCategoryById(id!);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCategories() {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: CATEGORY_KEYS.lists(),
    queryFn: async () => {
      const res = await categoryService.getAllCategories();
      return res.data;
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: CategoryOutput) => categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryOutput }) =>
      categoryService.updateCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: CATEGORY_KEYS.detail(variables.id),
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
  });

  return {
    categories: categoriesQuery.data || [],
    isLoading: categoriesQuery.isLoading,
    isError: categoriesQuery.isError,
    refetchCategories: categoriesQuery.refetch,

    createCategory: createCategoryMutation.mutateAsync,
    updateCategory: updateCategoryMutation.mutateAsync,
    deleteCategory: deleteCategoryMutation.mutateAsync,

    isCreating: createCategoryMutation.isPending,
    isUpdating: updateCategoryMutation.isPending,
    isDeleting: deleteCategoryMutation.isPending,
  };
}
