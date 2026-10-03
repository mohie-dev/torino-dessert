"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { AccessNotice, DataError } from "@/components/admin/admin-feedback";
import {
  cancelOrder,
  fetchOrderDetails,
  fetchOrders,
  updateOrderStatus,
  type Order,
} from "@/lib/admin-api";
import { formatCurrency } from "@/lib/format";
import type { OrderStatus } from "@/schemas/api-schemas";
import { useAuth } from "@/contexts/auth-context";
import { useUIStore } from "@/stores/ui-store";

const statuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELLED",
];

const statusStyle: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-900",
  CONFIRMED: "bg-sky-100 text-sky-900",
  PREPARING: "bg-violet-100 text-violet-900",
  OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-900",
  COMPLETED: "bg-emerald-100 text-emerald-900",
  CANCELLED: "bg-red-100 text-red-900",
};

function formatDate(date: string): string {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "—";
  return new Intl.DateTimeFormat("en-EG-u-nu-latn", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default function AdminOrdersPage() {
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const notify = useUIStore((state) => state.notify);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const limit = 10;

  const ordersQuery = useQuery({
    queryKey: ["admin", "orders", { page, limit, statusFilter, search }],
    queryFn: () =>
      fetchOrders({
        page,
        limit,
        status: statusFilter || undefined,
        search: search || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
    enabled: hasPermission("orders:read"),
  });
  const orderDetailsQuery = useQuery({
    queryKey: ["admin", "order", selectedOrderId],
    queryFn: () => fetchOrderDetails(selectedOrderId!),
    enabled: Boolean(selectedOrderId) && hasPermission("orders:read"),
  });

  const mutation = useMutation({
    mutationFn: ({ order, status }: { order: Order; status: OrderStatus }) =>
      status === "CANCELLED"
        ? cancelOrder(order.id)
        : updateOrderStatus(order.id, status),
    onSuccess: async (_, { status }) => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "dashboard-stats"] });
      notify("success", `Order updated to ${status.replaceAll("_", " ").toLowerCase()}.`);
    },
    onError: (error) =>
      notify("error", error instanceof Error ? error.message : "Could not update order."),
  });

  const orders = useMemo(() => ordersQuery.data?.data ?? [], [ordersQuery.data]);
  const meta = ordersQuery.data?.meta;

  if (!hasPermission("orders:read")) {
    return <AccessNotice message="You don’t have permission to view orders." />;
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-chocolate-light">Keep every order moving</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-ink">Orders</h1>
        </div>
        <p className="text-sm text-muted">{meta ? `${meta.total} total orders` : "Order management"}</p>
      </div>

      <div className="mt-7 flex flex-col gap-3 rounded-3xl border border-[#eee7df] bg-surface p-4 shadow-card">
        <form className="flex flex-1 gap-2" onSubmit={submitSearch} role="search">
          <label className="relative flex-1">
            <span className="sr-only">Search orders by number or phone</span>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={17} />
            <input
              className="h-11 w-full rounded-xl border border-cream-dark bg-white pl-10 pr-3 text-sm"
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Order number or customer phone"
              value={searchInput}
            />
          </label>
          <button className="rounded-xl bg-chocolate px-4 text-sm font-semibold text-white hover:bg-chocolate-dark" type="submit">Search</button>
        </form>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-medium text-muted">
            From
            <input
              className="mt-1 block h-10 rounded-xl border border-cream-dark bg-white px-3 text-sm text-ink"
              max={endDate || undefined}
              onChange={(event) => { setPage(1); setStartDate(event.target.value); }}
              type="date"
              value={startDate}
            />
          </label>
          <label className="text-xs font-medium text-muted">
            To
            <input
              className="mt-1 block h-10 rounded-xl border border-cream-dark bg-white px-3 text-sm text-ink"
              min={startDate || undefined}
              onChange={(event) => { setPage(1); setEndDate(event.target.value); }}
              type="date"
              value={endDate}
            />
          </label>
          <label className="text-xs font-medium text-muted">
            <span className="sr-only">Filter by status</span>
            <select
              className="h-10 min-w-40 rounded-xl border border-cream-dark bg-white px-3 text-sm text-ink"
              onChange={(event) => {
                setPage(1);
                setStatusFilter(event.target.value as OrderStatus | "");
              }}
              value={statusFilter}
            >
              <option value="">All statuses</option>
              {statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
            </select>
          </label>
        </div>
      </div>

      {ordersQuery.isError && <DataError onRetry={() => void ordersQuery.refetch()} />}

      <div className="mt-5 overflow-hidden rounded-3xl border border-[#eee7df] bg-surface shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#eee7df] bg-[#fcfaf7] text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-4 font-semibold">Order</th>
                <th className="px-5 py-4 font-semibold">Customer</th>
                <th className="px-5 py-4 font-semibold">Placed</th>
                <th className="px-5 py-4 font-semibold">Total</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ebe5]">
              {ordersQuery.isLoading ? (
                Array.from({ length: 5 }, (_, index) => (
                  <tr key={index}>
                    {Array.from({ length: 6 }, (_, cell) => (
                      <td className="px-5 py-5" key={cell}><span className="block h-4 animate-pulse rounded bg-cream" /></td>
                    ))}
                  </tr>
                ))
              ) : orders.length ? (
                orders.map((order) => (
                  <tr className="text-sm" key={order.id}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-ink">{order.orderNumber}</p>
                      <p className="mt-1 text-xs text-muted">{order.items?.length ?? 0} items</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-ink">{order.customerName}</p>
                      <a className="mt-1 block text-xs text-muted hover:text-chocolate" href={`tel:${order.customerPhone}`}>{order.customerPhone}</a>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted">{formatDate(order.createdAt)}</td>
                    <td className="px-5 py-4 font-semibold text-chocolate">{formatCurrency(order.total)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-semibold ${statusStyle[order.status]}`}>
                        {order.status.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="rounded-lg px-3 py-2 text-xs font-semibold text-chocolate hover:bg-cream"
                          onClick={() => setSelectedOrderId(order.id)}
                          type="button"
                        >
                          Details
                        </button>
                        <select
                          aria-label={`Update status for order ${order.orderNumber}`}
                          className="h-9 max-w-48 rounded-xl border border-cream-dark bg-white px-2 text-xs text-ink disabled:opacity-50"
                          disabled={mutation.isPending || order.status === "CANCELLED" || order.status === "COMPLETED"}
                          onChange={(event) => {
                            const nextStatus = event.target.value as OrderStatus;
                            if (nextStatus !== order.status) mutation.mutate({ order, status: nextStatus });
                          }}
                          value={order.status}
                        >
                          {statuses.map((status) => (
                            <option
                              disabled={status === "CANCELLED" && order.status !== "PENDING"}
                              key={status}
                              value={status}
                            >
                              {status.replaceAll("_", " ")}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              ) : !ordersQuery.isError ? (
                <tr><td className="px-6 py-16 text-center text-sm text-muted" colSpan={6}>No orders match these filters.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[#eee7df] px-5 py-4 text-sm">
          <span className="text-muted">Page {meta?.page ?? page} of {Math.max(meta?.totalPages ?? 0, 1)}</span>
          <div className="flex gap-2">
            <button
              className="rounded-xl border border-cream-dark px-4 py-2 font-medium text-chocolate disabled:cursor-not-allowed disabled:opacity-40"
              disabled={page <= 1 || ordersQuery.isFetching}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              type="button"
            >
              Previous
            </button>
            <button
              className="rounded-xl border border-cream-dark px-4 py-2 font-medium text-chocolate disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!meta || page >= meta.totalPages || ordersQuery.isFetching}
              onClick={() => setPage((current) => current + 1)}
              type="button"
            >
              Next
            </button>
          </div>
        </div>

        {selectedOrderId && (
          <div
            className="fixed inset-0 z-[70] grid place-items-center bg-ink/50 p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelectedOrderId(null);
            }}
          >
            <section
              aria-labelledby="order-detail-title"
              aria-modal="true"
              className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-surface p-5 shadow-elevated sm:p-8"
              role="dialog"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-chocolate-light">Order details</p>
                  <h2 className="mt-1 font-display text-3xl font-semibold text-ink" id="order-detail-title">
                    {orderDetailsQuery.data?.orderNumber ?? "Loading order…"}
                  </h2>
                </div>
                <button
                  aria-label="Close order details"
                  className="grid size-9 place-items-center rounded-xl hover:bg-cream"
                  onClick={() => setSelectedOrderId(null)}
                  type="button"
                >
                  <X size={18} />
                </button>
              </div>
              {orderDetailsQuery.isLoading ? (
                <div className="mt-6 h-48 animate-pulse rounded-2xl bg-cream" />
              ) : orderDetailsQuery.isError ? (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900" role="alert">
                  Could not load order details.
                  <button className="ml-2 font-semibold underline" onClick={() => void orderDetailsQuery.refetch()} type="button">Retry</button>
                </div>
              ) : orderDetailsQuery.data ? (
                <div className="mt-6">
                  <div className="grid gap-4 rounded-2xl bg-cream/60 p-4 text-sm sm:grid-cols-2">
                    <p><span className="text-muted">Customer: </span><span className="font-medium text-ink">{orderDetailsQuery.data.customer?.name ?? orderDetailsQuery.data.customerName}</span></p>
                    <p><span className="text-muted">Phone: </span><a className="font-medium text-chocolate" href={`tel:${orderDetailsQuery.data.customerPhone}`}>{orderDetailsQuery.data.customerPhone}</a></p>
                    <p className="sm:col-span-2"><span className="text-muted">Delivery address: </span><span className="text-ink">{orderDetailsQuery.data.deliveryAddress}</span></p>
                    <p><span className="text-muted">Placed: </span><span className="text-ink">{formatDate(orderDetailsQuery.data.createdAt)}</span></p>
                    <p><span className="text-muted">Payment: </span><span className="text-ink">{orderDetailsQuery.data.paymentMethod.replaceAll("_", " ")}</span></p>
                  </div>
                  {orderDetailsQuery.data.notes && (
                    <p className="mt-4 rounded-xl border border-cream-dark px-4 py-3 text-sm">
                      <span className="font-semibold text-ink">Customer notes: </span>
                      <span className="text-muted">{orderDetailsQuery.data.notes}</span>
                    </p>
                  )}
                  <h3 className="mt-6 font-display text-xl font-semibold text-ink">Items</h3>
                  <ul className="mt-2 divide-y divide-[#eee7df]">
                    {orderDetailsQuery.data.items.map((item) => (
                      <li className="flex justify-between gap-3 py-3 text-sm" key={item.id}>
                        <span className="text-ink">{item.productName} <span className="text-muted">× {item.quantity}</span></span>
                        <span className="font-medium text-chocolate">{formatCurrency(item.subtotal)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 space-y-2 border-t border-[#eee7df] pt-4 text-sm">
                    <p className="flex justify-between text-muted"><span>Subtotal</span><span>{formatCurrency(orderDetailsQuery.data.subtotal)}</span></p>
                    <p className="flex justify-between text-muted"><span>Delivery</span><span>{formatCurrency(orderDetailsQuery.data.deliveryFee)}</span></p>
                    <p className="flex justify-between font-semibold text-ink"><span>Total</span><span>{formatCurrency(orderDetailsQuery.data.total)}</span></p>
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
