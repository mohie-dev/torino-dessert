"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  CakeSlice,
  ClipboardList,
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
import { useAuth } from "@/contexts/auth-context";
import { useUIStore } from "@/stores/ui-store";
import { BrandLockup } from "@/components/brand-lockup";

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
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                    active ? "bg-white text-chocolate-dark shadow-sm" : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                  href={href}
                  key={href}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  {label}
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
