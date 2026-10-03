"use client";

import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/auth-context";
import { AccessNotice, DataError } from "@/components/admin/admin-feedback";
import { fetchAdminSettings, saveAdminSettings } from "@/lib/admin-api";
import { useUIStore } from "@/stores/ui-store";
import {
  updateSettingsSchema,
  type UpdateSettingsInput,
  type UpdateSettingsValues,
} from "@/schemas/api-schemas";

const inputClass =
  "mt-2 w-full rounded-2xl border border-cream-dark bg-white px-4 py-3 text-sm text-ink";

export default function AdminSettingsPage() {
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const notify = useUIStore((state) => state.notify);
  const settingsQuery = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: fetchAdminSettings,
    enabled: hasPermission("settings:manage"),
  });
  const defaults = useMemo(
    () => ({
      storeName: settingsQuery.data?.storeName ?? "",
      phone: settingsQuery.data?.phone ?? "",
      whatsapp: settingsQuery.data?.whatsapp ?? "",
      facebookUrl: settingsQuery.data?.facebookUrl ?? "",
      instagramUrl: settingsQuery.data?.instagramUrl ?? "",
      deliveryFee:
        settingsQuery.data === undefined
          ? undefined
          : Number(settingsQuery.data.deliveryFee),
      isOpen: settingsQuery.data?.isOpen ?? true,
    }),
    [settingsQuery.data],
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateSettingsInput, unknown, UpdateSettingsValues>({
    resolver: zodResolver(updateSettingsSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (settingsQuery.data) reset(defaults);
  }, [settingsQuery.data, defaults, reset]);

  if (!hasPermission("settings:manage")) {
    return <AccessNotice message="You don’t have permission to manage store settings." />;
  }

  async function onSubmit(values: UpdateSettingsValues) {
    try {
      const payload = Object.fromEntries(
        Object.entries(values).filter(([, value]) => value !== undefined),
      );
      await saveAdminSettings(payload);
      await queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      await queryClient.invalidateQueries({ queryKey: ["storefront", "settings"] });
      notify("success", "Store settings saved.");
    } catch (error) {
      notify(
        "error",
        error instanceof Error ? error.message : "Could not save store settings.",
      );
    }
  }

  return (
    <div className="max-w-4xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-chocolate-light">Manage your storefront</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-ink">Store settings</h1>
        <p className="mt-2 text-sm text-muted">Keep your public contact details and ordering availability up to date.</p>
      </div>

      {settingsQuery.isError && <DataError onRetry={() => void settingsQuery.refetch()} />}
      {settingsQuery.isLoading ? (
        <div className="mt-8 h-96 animate-pulse rounded-3xl bg-cream" />
      ) : settingsQuery.data ? (
        <form className="mt-8 space-y-7" onSubmit={handleSubmit(onSubmit)} noValidate>
          <section className="rounded-3xl border border-[#eee7df] bg-surface p-5 shadow-card sm:p-8">
            <h2 className="font-display text-2xl font-semibold text-chocolate">Store information</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium text-ink sm:col-span-2">
                Store name
                <input className={inputClass} {...register("storeName")} maxLength={150} />
                {errors.storeName && <span className="mt-1 block text-xs text-velvet">{errors.storeName.message}</span>}
              </label>
              <label className="text-sm font-medium text-ink">
                Phone
                <input className={inputClass} {...register("phone")} maxLength={20} inputMode="tel" />
                {errors.phone && <span className="mt-1 block text-xs text-velvet">{errors.phone.message}</span>}
              </label>
              <label className="text-sm font-medium text-ink">
                WhatsApp
                <input className={inputClass} {...register("whatsapp")} maxLength={20} inputMode="tel" />
                {errors.whatsapp && <span className="mt-1 block text-xs text-velvet">{errors.whatsapp.message}</span>}
              </label>
              <label className="text-sm font-medium text-ink">
                Facebook URL
                <input className={inputClass} {...register("facebookUrl")} type="url" placeholder="https://facebook.com/…" />
                {errors.facebookUrl && <span className="mt-1 block text-xs text-velvet">{errors.facebookUrl.message}</span>}
              </label>
              <label className="text-sm font-medium text-ink">
                Instagram URL
                <input className={inputClass} {...register("instagramUrl")} type="url" placeholder="https://instagram.com/…" />
                {errors.instagramUrl && <span className="mt-1 block text-xs text-velvet">{errors.instagramUrl.message}</span>}
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-[#eee7df] bg-surface p-5 shadow-card sm:p-8">
            <h2 className="font-display text-2xl font-semibold text-chocolate">Ordering and delivery</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 sm:items-end">
              <label className="text-sm font-medium text-ink">
                Delivery fee
                <div className="relative mt-2">
                  <input
                    className="w-full rounded-2xl border border-cream-dark bg-white px-4 py-3 pr-14 text-sm text-ink"
                    min="0"
                    step="0.01"
                    type="number"
                    {...register("deliveryFee", { valueAsNumber: true })}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted">EGP</span>
                </div>
                {errors.deliveryFee && <span className="mt-1 block text-xs text-velvet">{errors.deliveryFee.message}</span>}
              </label>
              <label className="flex min-h-12 items-center justify-between gap-4 rounded-2xl bg-cream/70 px-4 py-3">
                <span>
                  <span className="block text-sm font-semibold text-ink">Accepting orders</span>
                  <span className="mt-1 block text-xs text-muted">Controls whether checkout is available</span>
                </span>
                <input
                  aria-label="Store is open for orders"
                  className="size-5 accent-velvet"
                  type="checkbox"
                  {...register("isOpen")}
                />
              </label>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-end gap-3">
            {isDirty && (
              <button
                className="rounded-full px-5 py-3 text-sm font-semibold text-chocolate hover:bg-cream"
                onClick={() => reset(defaults)}
                type="button"
              >
                Discard changes
              </button>
            )}
            <button
              className="rounded-full bg-velvet px-6 py-3 text-sm font-semibold text-white hover:bg-velvet-dark disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting || !isDirty}
              type="submit"
            >
              {isSubmitting ? "Saving…" : "Save settings"}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
