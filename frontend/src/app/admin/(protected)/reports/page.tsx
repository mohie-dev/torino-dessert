"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, Package, ShoppingBag, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { AccessNotice, DataError } from "@/components/admin/admin-feedback";
import { fetchSalesReport, fetchTopProducts } from "@/lib/admin-api";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/contexts/auth-context";

function asStartOfDay(date: string): string {
  return `${date}T00:00:00.000Z`;
}

function asEndOfDay(date: string): string {
  return `${date}T23:59:59.999Z`;
}

function getDefaultDates() {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 29);
  return {
    start: start.toISOString().slice(0, 10),
    end: today.toISOString().slice(0, 10),
  };
}

export default function AdminReportsPage() {
  const { hasPermission } = useAuth();
  const defaults = useMemo(getDefaultDates, []);
  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);
  const [limit, setLimit] = useState(5);
  const validRange = Boolean(startDate && endDate && startDate <= endDate);
  const queryRange = {
    startDate: asStartOfDay(startDate),
    endDate: asEndOfDay(endDate),
  };

  const salesQuery = useQuery({
    queryKey: ["admin", "reports", "sales", queryRange],
    queryFn: () => fetchSalesReport(queryRange),
    enabled: hasPermission("reports:read") && validRange,
  });
  const productsQuery = useQuery({
    queryKey: ["admin", "reports", "top-products", queryRange, limit],
    queryFn: () => fetchTopProducts({ ...queryRange, limit }),
    enabled: hasPermission("reports:read") && validRange,
  });

  if (!hasPermission("reports:read")) {
    return <AccessNotice message="You don’t have permission to view reports." />;
  }

  const report = salesQuery.data;
  const products = productsQuery.data ?? [];
  const maxQuantity = Math.max(...products.map((product) => product.totalQuantitySold), 1);

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-chocolate-light">Know what customers love</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-ink">Reports & analytics</h1>
        </div>
        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-[#eee7df] bg-surface p-3 shadow-card">
          <label className="text-xs font-medium text-muted">
            From
            <input
              className="mt-1 block h-10 rounded-xl border border-cream-dark bg-white px-3 text-sm text-ink"
              max={endDate || undefined}
              onChange={(event) => setStartDate(event.target.value)}
              type="date"
              value={startDate}
            />
          </label>
          <label className="text-xs font-medium text-muted">
            To
            <input
              className="mt-1 block h-10 rounded-xl border border-cream-dark bg-white px-3 text-sm text-ink"
              min={startDate || undefined}
              onChange={(event) => setEndDate(event.target.value)}
              type="date"
              value={endDate}
            />
          </label>
        </div>
      </div>

      {!validRange && (
        <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950" role="alert">
          Choose a valid date range. The start date must be on or before the end date.
        </p>
      )}
      {salesQuery.isError && <DataError onRetry={() => void salesQuery.refetch()} />}
      {productsQuery.isError && <DataError onRetry={() => void productsQuery.refetch()} />}

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Revenue", value: report ? formatCurrency(report.totalRevenue) : "—", icon: TrendingUp },
          { title: "Total orders", value: report?.totalOrders ?? "—", icon: ShoppingBag },
          { title: "Completed", value: report?.completedOrders ?? "—", icon: Package },
          { title: "Average order value", value: report ? formatCurrency(report.averageOrderValue) : "—", icon: BarChart3 },
        ].map(({ title, value, icon: Icon }) => (
          <section className="rounded-3xl border border-[#eee7df] bg-surface p-5 shadow-card" key={title}>
            <div className="flex items-start justify-between">
              <p className="text-sm text-muted">{title}</p>
              <span className="grid size-10 place-items-center rounded-2xl bg-cream text-chocolate"><Icon size={18} /></span>
            </div>
            {salesQuery.isLoading ? (
              <div className="mt-5 h-8 w-28 animate-pulse rounded-lg bg-cream" />
            ) : (
              <p className="mt-4 font-display text-3xl font-semibold text-ink">{value}</p>
            )}
          </section>
        ))}
      </div>

      <section className="mt-7 rounded-3xl border border-[#eee7df] bg-surface p-5 shadow-card sm:p-8">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">Top products</h2>
            <p className="mt-1 text-sm text-muted">Ranked by quantity sold, excluding cancelled orders.</p>
          </div>
          <label className="text-xs font-medium text-muted">
            Show
            <select
              className="ml-2 h-10 rounded-xl border border-cream-dark bg-white px-3 text-sm text-ink"
              onChange={(event) => setLimit(Number(event.target.value))}
              value={limit}
            >
              {[5, 10, 20].map((option) => <option key={option} value={option}>{option} products</option>)}
            </select>
          </label>
        </div>

        {productsQuery.isLoading ? (
          <div className="mt-7 space-y-5">
            {Array.from({ length: limit }, (_, index) => <div className="h-10 animate-pulse rounded-xl bg-cream" key={index} />)}
          </div>
        ) : products.length ? (
          <ol className="mt-7 space-y-5">
            {products.map((product, index) => (
              <li className="grid grid-cols-[28px_1fr_auto] items-center gap-3 sm:grid-cols-[36px_1fr_auto]" key={product.productId}>
                <span className="font-display text-xl font-semibold text-chocolate-light">{String(index + 1).padStart(2, "0")}</span>
                <div className="min-w-0">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-semibold text-ink">{product.productName}</span>
                    <span className="shrink-0 text-xs text-muted">{product.totalQuantitySold} sold</span>
                  </div>
                  <div aria-label={`${product.productName}: ${product.totalQuantitySold} sold`} className="h-2 overflow-hidden rounded-full bg-cream">
                    <div className="h-full rounded-full bg-chocolate" style={{ width: `${(product.totalQuantitySold / maxQuantity) * 100}%` }} />
                  </div>
                </div>
                <span className="hidden text-xs text-muted sm:block">Units</span>
              </li>
            ))}
          </ol>
        ) : !productsQuery.isError ? (
          <div className="mt-7 rounded-2xl bg-cream/60 px-5 py-10 text-center text-sm text-muted">
            No product sales found for this date range.
          </div>
        ) : null}

        {report && (
          <p className="mt-6 border-t border-[#eee7df] pt-5 text-xs text-muted">
            {report.cancelledOrders} cancelled {report.cancelledOrders === 1 ? "order" : "orders"} in the selected period.
          </p>
        )}
      </section>
    </div>
  );
}
