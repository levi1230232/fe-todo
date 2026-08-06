import { api } from "@/lib/axios";
import {
  CategoryResponse,
  createCategoryDto,
  UpdateCategoryDto,
} from "@/types/category";

export const categoryService = {
  getAllCategories() {
    return api.get<CategoryResponse[]>("/categories");
  },

  getCategoryById(id: number) {
    return api.get<CategoryResponse>(`/categories/${id}`);
  },

  createCategory(data: createCategoryDto) {
    return api.post<CategoryResponse>("/categories", data);
  },

  updateCategory(id: number, data: UpdateCategoryDto) {
    return api.put<CategoryResponse>(`/categories/${id}`, data);
  },

  deleteCategory(id: number) {
    return api.delete(`/categories/${id}`);
  },
};
