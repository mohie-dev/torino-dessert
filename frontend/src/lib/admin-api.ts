import { api } from "@/lib/api";
import type { OrderStatus } from "@/schemas/api-schemas";
import type { Paginated, StoreSettings } from "@/lib/store-api";

export interface DashboardStats {
  totalOrders: number;
  activeOrders: number;
  todaysOrders: number;
  todaysRevenue: number;
  totalRevenue: number;
}

export interface OrderItem {
  id: string;
  productName: string;
  unitPrice: number | string;
  quantity: number;
  subtotal: number | string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  deliveryAddress: string;
  notes?: string | null;
  subtotal: number | string;
  deliveryFee: number | string;
  total: number | string;
  status: OrderStatus;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
  customer?: {
    name: string;
    phone: string;
    email?: string | null;
  };
}

export interface OrderPage {
  data: Order[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface SalesReport {
  dateRange: { startDate: string; endDate: string };
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalQuantitySold: number;
}

export interface StaffUser {
  id: string;
  firstName: string;
  lastName?: string | null;
  email: string;
  roleId?: string | null;
  role?: { id: string; name: string; permissions?: string[] } | null;
  isActive: boolean;
}

export interface AdminRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number | string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  createdAt: string;
  orders?: CustomerOrder[];
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await api.get<DashboardStats>("/orders/stats");
  return response.data;
}

export async function fetchOrders(params: {
  page: number;
  limit: number;
  status?: OrderStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
}): Promise<OrderPage> {
  const response = await api.get<OrderPage>("/orders", { params });
  return response.data;
}

export async function fetchOrderDetails(id: string): Promise<Order> {
  const response = await api.get<Order>(`/orders/${id}`);
  return response.data;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order> {
  const response = await api.patch<Order>(`/orders/${id}/status`, { status });
  return response.data;
}

export async function cancelOrder(id: string): Promise<Order> {
  const response = await api.patch<Order>(`/orders/${id}/cancel`);
  return response.data;
}

export async function fetchAdminSettings(): Promise<StoreSettings> {
  const response = await api.get<StoreSettings>("/settings");
  return response.data;
}

export async function saveAdminSettings(
  settings: Record<string, unknown>,
): Promise<StoreSettings> {
  const response = await api.patch<StoreSettings>("/settings", settings);
  return response.data;
}

export async function fetchSalesReport(params: {
  startDate: string;
  endDate: string;
}): Promise<SalesReport> {
  const response = await api.get<SalesReport>("/reports/sales", { params });
  return response.data;
}

export async function fetchTopProducts(params: {
  startDate: string;
  endDate: string;
  limit: number;
}): Promise<TopProduct[]> {
  const response = await api.get<TopProduct[]>("/reports/top-products", {
    params,
  });
  return response.data;
}

export async function fetchStaffUsers(): Promise<StaffUser[]> {
  const response = await api.get<StaffUser[]>("/users");
  return response.data;
}

export async function createStaffUser(
  payload: Record<string, unknown>,
): Promise<StaffUser> {
  const response = await api.post<StaffUser>("/users", payload);
  return response.data;
}

export async function updateStaffUser(
  id: string,
  payload: Record<string, unknown>,
): Promise<StaffUser> {
  const response = await api.patch<StaffUser>(`/users/${id}`, payload);
  return response.data;
}

export async function setStaffUserStatus(
  id: string,
  isActive: boolean,
): Promise<StaffUser> {
  const response = await api.patch<StaffUser>(`/users/${id}/status`, { isActive });
  return response.data;
}

export async function fetchRoles(): Promise<AdminRole[]> {
  const response = await api.get<AdminRole[]>("/roles");
  return response.data;
}

export async function createRole(
  payload: Record<string, unknown>,
): Promise<AdminRole> {
  const response = await api.post<AdminRole>("/roles", payload);
  return response.data;
}

export async function updateRole(
  id: string,
  payload: Record<string, unknown>,
): Promise<AdminRole> {
  const response = await api.patch<AdminRole>(`/roles/${id}`, payload);
  return response.data;
}

export async function deleteRole(id: string): Promise<void> {
  await api.delete(`/roles/${id}`);
}

export async function fetchCustomers(params: {
  search?: string;
  page: number;
  limit: number;
}): Promise<Paginated<Customer>> {
  const response = await api.get<Paginated<Customer>>("/customers", { params });
  return response.data;
}

export async function fetchCustomerDetails(id: string): Promise<Customer> {
  const response = await api.get<Customer>(`/customers/${id}`);
  return response.data;
}
