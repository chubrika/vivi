export interface Category {
  _id: string;
  name: string;
  description: string;
  slug: string;
  parentId?: string;
  children?: Category[];
  hasChildren: boolean;
  isActive: boolean;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  description: string;
  slug: string;
  parentId?: string;
  isActive: boolean;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  slug?: string;
  parentId?: string;
  isActive?: boolean;
} 