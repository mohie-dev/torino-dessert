"use client";

import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { useState } from "react";
import { AccessNotice, DataError } from "@/components/admin/admin-feedback";
import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api";
import { fetchCustomerDetails, fetchCustomers } from "@/lib/admin-api";
import { formatCurrency } from "@/lib/format";
import type { OrderStatus } from "@/schemas/api-schemas";

function dateLabel(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-EG-u-nu-latn", {
        dateStyle: "medium",
      }).format(date);
}

const orderStatusClass: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-900",
  CONFIRMED: "bg-sky-100 text-sky-900",
  PREPARING: "bg-violet-100 text-violet-900",
  OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-900",
  COMPLETED: "bg-emerald-100 text-emerald-900",
  CANCELLED: "bg-red-100 text-red-900",
};

export default function AdminCustomersPage() {
  const { hasPermission } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const limit = 10;

  const customersQuery = useQuery({
    queryKey: ["admin", "customers", { search, page, limit }],
    queryFn: () => fetchCustomers({ search: search || undefined, page, limit }),
    enabled: hasPermission("customers:read"),
  });
  const detailQuery = useQuery({
    queryKey: ["admin", "customer", customerId],
    queryFn: () => fetchCustomerDetails(customerId!),
    enabled: Boolean(customerId) && hasPermission("customers:read"),
  });

  const customersErrorMessage =
    customersQuery.error instanceof ApiRequestError
      ? customersQuery.error.status === 403
        ? "Your account is not authorized to load customers (HTTP 403). Ask an administrator to grant the customers:read permission."
        : customersQuery.error.status === 0
          ? "Could not reach the API while loading customers. Check that the backend is running and try again."
          : customersQuery.error.status >= 500
            ? `The API failed while loading customers (HTTP ${customersQuery.error.status}).`
            : `Could not load customers (HTTP ${customersQuery.error.status}): ${customersQuery.error.message}`
      : undefined;

  if (!hasPermission("customers:read")) {
    return <AccessNotice message="You don’t have permission to view customers." />;
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-chocolate-light">Get to know your regulars</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-ink">Customers</h1>
        </div>
        <p className="text-sm text-muted">
          {customersQuery.data ? `${customersQuery.data.meta.total} customers` : "Customer directory"}
        </p>
      </div>

      <form
        className="mt-7 flex max-w-xl gap-2 rounded-3xl border border-[#eee7df] bg-surface p-4 shadow-card"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setSearch(searchInput.trim());
        }}
        role="search"
      >
        <label className="relative flex-1">
          <span className="sr-only">Search by customer name or phone</span>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={17} />
          <input
            className="h-11 w-full rounded-xl border border-cream-dark bg-white pl-10 pr-3 text-sm"
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search name or phone number"
            value={searchInput}
          />
        </label>
        <button className="rounded-xl bg-chocolate px-4 text-sm font-semibold text-white hover:bg-chocolate-dark" type="submit">Search</button>
      </form>

      {customersQuery.isError && (
        <DataError
          message={customersErrorMessage}
          onRetry={() => void customersQuery.refetch()}
        />
      )}

      <section className="mt-5 overflow-hidden rounded-3xl border border-[#eee7df] bg-surface shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#eee7df] bg-[#fcfaf7] text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-4 font-semibold">Customer</th>
                <th className="px-5 py-4 font-semibold">Phone</th>
                <th className="px-5 py-4 font-semibold">Email</th>
                <th className="px-5 py-4 font-semibold">Customer since</th>
                <th className="px-5 py-4 text-right font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ebe5]">
              {customersQuery.isLoading ? (
                Array.from({ length: 5 }, (_, index) => (
                  <tr key={index}>{Array.from({ length: 5 }, (_, cell) => (
                    <td className="px-5 py-5" key={cell}><span className="block h-4 animate-pulse rounded bg-cream" /></td>
                  ))}</tr>
                ))
              ) : customersQuery.data?.data.length ? (
                customersQuery.data.data.map((customer) => (
                  <tr className="text-sm" key={customer.id}>
                    <td className="px-5 py-4 font-semibold text-ink">{customer.name}</td>
                    <td className="px-5 py-4">
                      <a className="text-chocolate hover:underline" href={`tel:${customer.phone}`}>{customer.phone}</a>
                    </td>
                    <td className="px-5 py-4 text-muted">{customer.email || "—"}</td>
                    <td className="px-5 py-4 text-muted">{dateLabel(customer.createdAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        className="rounded-full border border-chocolate/20 px-3 py-1.5 text-xs font-semibold text-chocolate hover:bg-cream"
                        onClick={() => setCustomerId(customer.id)}
                        type="button"
                      >
                        Order history
                      </button>
                    </td>
                  </tr>
                ))
              ) : !customersQuery.isError ? (
                <tr><td className="px-6 py-16 text-center text-sm text-muted" colSpan={5}>No customers found.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#eee7df] px-5 py-4 text-sm">
          <span className="text-muted">Page {customersQuery.data?.meta.page ?? page} of {Math.max(customersQuery.data?.meta.totalPages ?? 0, 1)}</span>
          <div className="flex gap-2">
            <button className="rounded-xl border border-cream-dark px-4 py-2 text-chocolate disabled:opacity-40" disabled={page <= 1 || customersQuery.isFetching} onClick={() => setPage((value) => value - 1)} type="button">Previous</button>
            <button className="rounded-xl border border-cream-dark px-4 py-2 text-chocolate disabled:opacity-40" disabled={!customersQuery.data || page >= customersQuery.data.meta.totalPages || customersQuery.isFetching} onClick={() => setPage((value) => value + 1)} type="button">Next</button>
          </div>
        </div>
      </section>

      {customerId && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-ink/50 p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setCustomerId(null);
        }}>
          <section aria-labelledby="customer-history-title" aria-modal="true" className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-surface p-5 shadow-elevated sm:p-8" role="dialog">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-chocolate-light">Customer profile</p>
                <h2 className="mt-1 font-display text-3xl font-semibold text-ink" id="customer-history-title">{detailQuery.data?.name ?? "Order history"}</h2>
              </div>
              <button aria-label="Close customer details" className="grid size-9 place-items-center rounded-xl hover:bg-cream" onClick={() => setCustomerId(null)} type="button"><X size={18} /></button>
            </div>

            {detailQuery.isLoading ? (
              <div className="mt-6 h-40 animate-pulse rounded-2xl bg-cream" />
            ) : detailQuery.isError ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900" role="alert">
                Could not load this customer’s history.
                <button className="ml-2 font-semibold underline" onClick={() => void detailQuery.refetch()} type="button">Retry</button>
              </div>
            ) : detailQuery.data ? (
              <>
                <div className="mt-5 grid gap-3 rounded-2xl bg-cream/60 p-4 text-sm sm:grid-cols-2">
                  <p><span className="text-muted">Phone: </span><a className="font-medium text-chocolate" href={`tel:${detailQuery.data.phone}`}>{detailQuery.data.phone}</a></p>
                  <p><span className="text-muted">Email: </span>{detailQuery.data.email || "—"}</p>
                </div>
                <h3 className="mt-7 font-display text-xl font-semibold text-ink">Recent orders</h3>
                {detailQuery.data.orders?.length ? (
                  <ul className="mt-3 divide-y divide-[#eee7df]">
                    {detailQuery.data.orders.map((order) => (
                      <li className="flex flex-wrap items-center justify-between gap-3 py-4" key={order.id}>
                        <div>
                          <p className="text-sm font-semibold text-ink">{order.orderNumber}</p>
                          <p className="mt-1 text-xs text-muted">{dateLabel(order.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${orderStatusClass[order.status]}`}>{order.status.replaceAll("_", " ")}</span>
                          <span className="text-sm font-semibold text-chocolate">{formatCurrency(order.total)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 rounded-xl bg-cream/60 p-4 text-sm text-muted">No previous orders.</p>
                )}
              </>
            ) : null}
          </section>
        </div>
      )}
    </div>
  );
}
