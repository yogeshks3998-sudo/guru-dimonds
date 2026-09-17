import { Category, Collection, Product } from '../types';
import { apiRequest, jsonRequest } from './api';

export const productApi = {
  listProducts: () => apiRequest<Product[]>('/products'),
  getProductBySlug: (slug: string) => apiRequest<Product>(`/products/${encodeURIComponent(slug)}`),
  createProduct: (product: Product) => jsonRequest<Product>('/products', 'POST', product),
  updateProduct: (id: string, product: Product) => jsonRequest<Product>(`/products/${encodeURIComponent(id)}`, 'PUT', product),
  deleteProduct: (id: string) => apiRequest<void>(`/products/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  listCategories: () => apiRequest<Category[]>('/categories'),
  createCategory: (category: Category) => jsonRequest<Category>(`/categories/${encodeURIComponent(category.id)}`, 'PUT', category),
  updateCategory: (id: string, category: Category) => jsonRequest<Category>(`/categories/${encodeURIComponent(id)}`, 'PUT', category),
  deleteCategory: (id: string) => apiRequest<void>(`/categories/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  listCollections: () => apiRequest<Collection[]>('/collections'),
};

