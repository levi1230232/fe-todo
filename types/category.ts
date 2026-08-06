export interface createCategoryDto {
  name: string;
  description: string;
  color: string;
}
export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  color?: string;
}
export interface Category extends Partial<createCategoryDto> {}
export interface CategoryResponse {
  id: number;
  name: string;
  description: string;
  color: string;
}
