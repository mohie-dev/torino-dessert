"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ClipboardList, DollarSign, PackageCheck, ShoppingBag } from "lucide-react";
import { fetchDashboardStats } from "@/lib/admin-api";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/contexts/auth-context";
import { AccessNotice, DataError } from "@/components/admin/admin-feedback";

export default function AdminOverviewPage() {
  const { hasPermission } = useAuth();
  const query = useQuery({
    queryKey: ["admin", "dashboard-stats"],
    queryFn: fetchDashboardStats,
    enabled: hasPermission("dashboard:read"),
  });

  if (!hasPermission("dashboard:read")) {
    return <AccessNotice message="Your account does not have permission to view dashboard statistics." />;
  }

  const stats = query.data;
  const cards = [
    { title: "All orders", value: stats?.totalOrders, icon: ShoppingBag, format: "number" },
    { title: "Active orders", value: stats?.activeOrders, icon: PackageCheck, format: "number" },
    { title: "Orders today", value: stats?.todaysOrders, icon: ClipboardList, format: "number" },
    { title: "Revenue today", value: stats?.todaysRevenue, icon: DollarSign, format: "currency" },
  ];

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-chocolate-light">Your store at a glance</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-ink">Overview</h1>
        </div>
        {hasPermission("orders:read") && (
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-velvet hover:text-velvet-dark" href="/admin/orders">
            View all orders <ArrowRight size={16} />
          </Link>
        )}
      </div>

      {query.isError && <DataError onRetry={() => void query.refetch()} />}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ title, value, icon: Icon, format }) => (
          <section className="rounded-3xl border border-[#eee7df] bg-surface p-5 shadow-card" key={title}>
            <div className="flex items-start justify-between">
              <p className="text-sm text-muted">{title}</p>
              <span className="grid size-10 place-items-center rounded-2xl bg-cream text-chocolate"><Icon size={18} /></span>
            </div>
            {query.isLoading ? (
              <div className="mt-5 h-8 w-28 animate-pulse rounded-lg bg-cream" />
            ) : (
              <p className="mt-4 font-display text-3xl font-semibold text-ink">
                {value === undefined ? "—" : format === "currency" ? formatCurrency(value) : value}
              </p>
            )}
          </section>
        ))}
      </div>

      <section className="mt-6 rounded-3xl border border-[#eee7df] bg-surface p-6 shadow-card sm:p-8">
        <p className="text-sm text-muted">All-time revenue</p>
        <p className="mt-2 font-display text-4xl font-semibold text-chocolate">
          {query.isLoading ? "…" : stats ? formatCurrency(stats.totalRevenue) : "—"}
        </p>
        <p className="mt-2 text-xs text-muted">Cancelled orders are excluded from revenue.</p>
      </section>
    </div>
  );
}
