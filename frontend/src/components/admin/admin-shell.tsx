"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  ArrowRight,
  Bell,
  CakeSlice,
  ClipboardList,
  Clock3,
  ContactRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings2,
  ShieldCheck,
  ShieldAlert,
  Store,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { useUIStore } from "@/stores/ui-store";
import { fetchOrders, type Order } from "@/lib/admin-api";
import { formatCurrency } from "@/lib/format";
import { BrandLockup } from "@/components/brand-lockup";
import { useOrdersSocket } from "@/hooks/use-orders-socket";

const navigation = [
  { label: "Overview", href: "/admin", permission: ["dashboard:read"], icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", permission: ["orders:read"], icon: ClipboardList },
  { label: "Products & categories", href: "/admin/products", permission: ["products:read"], icon: Package },
  { label: "Customers", href: "/admin/customers", permission: ["customers:read"], icon: ContactRound },
  { label: "Reports", href: "/admin/reports", permission: ["reports:read"], icon: BarChart3 },
  { label: "Store settings", href: "/admin/settings", permission: ["settings:manage"], icon: Settings2 },
  { label: "Team & roles", href: "/admin/team", permission: ["users:manage", "roles:manage"], icon: ShieldCheck },
];

function LoadingScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-cream">
      <div className="text-center">
        <span className="mx-auto grid size-12 animate-pulse place-items-center rounded-full bg-chocolate text-lg font-semibold text-white">T</span>
        <p className="mt-4 text-sm text-muted">Loading your workspace…</p>
      </div>
    </main>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, status, logout, hasPermission } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const notify = useUIStore((state) => state.notify);
  const canReadOrders =
    status === "authenticated" && hasPermission("orders:read");
  const pendingOrdersQuery = useQuery({
    queryKey: ["admin", "pending-order-count"],
    queryFn: async () => {
      const response = await fetchOrders({
        page: 1,
        limit: 4,
        status: "PENDING",
      });
      return { count: response.meta.total, orders: response.data };
    },
    enabled: canReadOrders,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });
  const pendingOrderCount = pendingOrdersQuery.data?.count ?? 0;

  useOrdersSocket(user?.id, canReadOrders);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/admin/login");
  }, [status, router]);

  const visibleNavigation = useMemo(
    () =>
      navigation.filter((item) =>
        item.permission.some((permission) => hasPermission(permission)),
      ),
    [hasPermission],
  );

  if (status === "loading" || status === "unauthenticated") return <LoadingScreen />;

  function signOut() {
    logout();
    notify("info", "You have signed out.");
    router.replace("/admin/login");
  }

  const displayName = [user?.firstName, user?.lastName]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(" ") || "Team member";
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f8f5f1]">
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          type="button"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col bg-chocolate-dark text-white transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-6">
          <Link className="flex items-center gap-3" href="/admin">
            <BrandLockup className="scale-[0.82] origin-left" iconSize="small" variant="dark" />
          </Link>
          <button
            aria-label="Close menu"
            className="grid size-9 place-items-center rounded-lg text-white/70 hover:bg-white/10 lg:hidden"
            onClick={() => setMobileOpen(false)}
            type="button"
          >
            <X size={19} />
          </button>
        </div>

        <div className="px-5 pt-7">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Workspace</p>
          <nav aria-label="Admin navigation" className="mt-3 space-y-1">
            {visibleNavigation.map(({ href, label, icon: Icon }) => {
              const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
              const unreadOrderCount =
                href === "/admin/orders" ? pendingOrderCount : 0;
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  aria-label={
                    unreadOrderCount
                      ? `${label}, ${unreadOrderCount} new orders not yet viewed`
                      : label
                  }
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                    active ? "bg-white text-chocolate-dark shadow-sm" : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                  href={href}
                  key={href}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span className="flex-1">{label}</span>
                  {unreadOrderCount > 0 && (
                    <span
                      aria-hidden="true"
                      className="grid min-w-5 place-items-center rounded-full bg-velvet px-1.5 py-0.5 text-[10px] font-bold leading-4 text-white"
                    >
                      {unreadOrderCount > 99 ? "99+" : unreadOrderCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-5">
          <Link className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/70 hover:bg-white/10 hover:text-white" href="/">
            <Store size={18} /> View storefront
          </Link>
          <button
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/70 hover:bg-white/10 hover:text-white"
            onClick={signOut}
            type="button"
          >
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-[270px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#e9e1d9] bg-surface/95 px-4 backdrop-blur sm:px-7">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open navigation"
              className="grid size-10 place-items-center rounded-xl text-chocolate hover:bg-cream lg:hidden"
              onClick={() => setMobileOpen(true)}
              type="button"
            >
              <Menu size={20} />
            </button>
            <div className="hidden items-center gap-2 text-sm text-muted sm:flex">
              <CakeSlice size={16} className="text-chocolate" />
              <span>Store management</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {canReadOrders && (
              <div className="group relative">
                <Link
                  aria-label={
                    pendingOrderCount
                      ? `${pendingOrderCount} orders awaiting confirmation`
                      : "No orders awaiting confirmation"
                  }
                  className="relative grid size-10 place-items-center rounded-xl text-chocolate outline-none hover:bg-cream focus-visible:ring-2 focus-visible:ring-velvet"
                  href="/admin/orders"
                >
                  <Bell size={19} />
                  {pendingOrderCount > 0 && (
                    <span
                      aria-hidden="true"
                      className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-velvet px-1.5 py-0.5 text-[10px] font-bold leading-4 text-white"
                    >
                      {pendingOrderCount > 99 ? "99+" : pendingOrderCount}
                    </span>
                  )}
                </Link>

                <div
                  className="invisible absolute right-0 top-full z-50 w-[min(22rem,calc(100vw-2rem))] translate-y-2 pt-3 opacity-0 transition duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100"
                  role="status"
                >
                  <div className="overflow-hidden rounded-2xl border border-[#eee7df] bg-white text-ink shadow-[0_20px_60px_-18px_rgba(45,31,23,0.35)]">
                    <div className="flex items-center justify-between bg-cream/70 px-5 py-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-chocolate-light">
                          Order queue
                        </p>
                        <h2 className="mt-1 font-display text-lg font-semibold">
                          Awaiting confirmation
                        </h2>
                      </div>
                      <span className="grid size-10 place-items-center rounded-full bg-white font-semibold text-velvet shadow-sm">
                        {pendingOrderCount > 99 ? "99+" : pendingOrderCount}
                      </span>
                    </div>

                    {pendingOrdersQuery.isLoading ? (
                      <p className="px-5 py-6 text-sm text-muted">
                        Checking for pending orders…
                      </p>
                    ) : pendingOrdersQuery.isError ? (
                      <p className="px-5 py-6 text-sm text-velvet">
                        Pending orders could not be loaded.
                      </p>
                    ) : pendingOrdersQuery.data?.orders.length ? (
                      <ul className="divide-y divide-[#f0ebe6]">
                        {pendingOrdersQuery.data.orders
                          .slice(0, 3)
                          .map((order: Order) => (
                            <li
                              className="flex items-center justify-between gap-3 px-5 py-3.5"
                              key={order.id}
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">
                                  {order.orderNumber}
                                </p>
                                <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                                  <Clock3 size={12} />
                                  {new Intl.DateTimeFormat("en-EG-u-nu-latn", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  }).format(new Date(order.createdAt))}
                                </p>
                              </div>
                              <span className="shrink-0 text-sm font-semibold text-chocolate">
                                {formatCurrency(order.total)}
                              </span>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="px-5 py-6 text-sm text-muted">
                        You’re all caught up. No orders are waiting.
                      </p>
                    )}

                    <Link
                      className="flex items-center justify-between border-t border-[#eee7df] px-5 py-3.5 text-sm font-semibold text-velvet transition hover:bg-cream/50"
                      href="/admin/orders"
                    >
                      Open order management
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            )}
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-ink">{displayName}</p>
              <p className="text-xs text-muted">Team account</p>
            </div>
            <span className="grid size-10 place-items-center rounded-full bg-cream font-semibold text-chocolate">
              {initials || "T"}
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-3 py-5 sm:px-7 sm:py-9">
          {visibleNavigation.length === 0 ? (
            <div className="mx-auto mt-12 max-w-lg rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
              <ShieldAlert className="mx-auto text-amber-800" size={30} />
              <h1 className="mt-4 font-display text-2xl font-semibold text-ink">No dashboard access</h1>
              <p className="mt-2 text-sm leading-6 text-muted">Your account is active, but no dashboard permissions have been assigned. Contact an administrator for access.</p>
            </div>
          ) : children}
        </main>
      </div>
    </div>
  );
}
