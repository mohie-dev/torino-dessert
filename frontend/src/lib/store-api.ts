import { api } from "@/lib/api";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  imageUrl: string | null;
  isAvailable: boolean;
  isArchived: boolean;
  categoryId: string;
  category?: Category;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface StoreSettings {
  storeName: string;
  phone: string | null;
  whatsapp: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  deliveryFee: number | string;
  isOpen: boolean;
}

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface CreateOrderPayload {
  customer: { name: string; phone: string; email?: string };
  items: { productId: string; quantity: number }[];
  deliveryAddress: string;
  notes?: string;
  paymentMethod: "CASH_ON_DELIVERY";
}

export interface CreatedOrder {
  id: string;
  orderNumber: string;
  total: number | string;
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await api.get<Category[]>("/categories");
  return response.data;
}

export async function fetchStorefrontProducts(params?: {
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<Paginated<Product>> {
  const response = await api.get<Paginated<Product>>("/products/storefront", {
    params: { page: 1, limit: 24, ...params },
  });
  return response.data;
}

export async function fetchStoreSettings(): Promise<StoreSettings> {
  const response = await api.get<StoreSettings>("/settings");
  return response.data;
}

export async function submitOrder(
  payload: CreateOrderPayload,
): Promise<CreatedOrder> {
  const response = await api.post<CreatedOrder>("/orders", payload);
  return response.data;
}

export async function fetchAdminCategories(): Promise<Category[]> {
  const response = await api.get<Category[]>("/categories");
  return response.data;
}

export async function fetchAdminProducts(params?: {
  search?: string;
  categoryId?: string;
  isArchived?: boolean;
  isAvailable?: boolean;
  page?: number;
  limit?: number;
}): Promise<Paginated<Product>> {
  const response = await api.get<Paginated<Product>>("/products", {
    params: { page: 1, limit: 20, isArchived: false, ...params },
  });
  return response.data;
}

export async function createProduct(
  product: Record<string, unknown>,
): Promise<Product> {
  const response = await api.post<Product>("/products", product);
  return response.data;
}

export async function updateProduct(
  id: string,
  product: Record<string, unknown>,
): Promise<Product> {
  const response = await api.patch<Product>(`/products/${id}`, product);
  return response.data;
}

export async function archiveProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

export async function restoreProduct(id: string): Promise<Product> {
  const response = await api.patch<Product>(`/products/${id}/restore`);
  return response.data;
}

export async function toggleProductAvailability(id: string): Promise<Product> {
  const response = await api.patch<Product>(`/products/${id}/toggle-availability`);
  return response.data;
}

export async function uploadProductImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const response = await api.post<{ imageUrl: string }>("/upload/image", body, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60_000,
  });
  return response.data.imageUrl;
}

export async function createCategory(
  category: Record<string, unknown>,
): Promise<Category> {
  const response = await api.post<Category>("/categories", category);
  return response.data;
}

export async function updateCategory(
  id: string,
  category: Record<string, unknown>,
): Promise<Category> {
  const response = await api.patch<Category>(`/categories/${id}`, category);
  return response.data;
}

export async function deactivateCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}
