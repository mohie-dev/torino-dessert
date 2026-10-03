"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api";
import { loginSchema, type LoginInput, type LoginValues } from "@/schemas/api-schemas";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput, unknown, LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setSubmitError(null);
    try {
      await login(values);
      router.replace("/admin");
    } catch (error) {
      setSubmitError(
        error instanceof ApiRequestError
          ? error.message
          : "Unable to sign in. Please try again.",
      );
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4 py-12">
      <section className="w-full max-w-md rounded-4xl bg-surface p-8 shadow-elevated sm:p-10">
        <Link className="mb-8 inline-block text-sm font-medium text-chocolate hover:text-velvet" href="/">
          ← Back to the shop
        </Link>
        <div className="mb-8">
          <p className="mb-2 font-display text-sm font-semibold uppercase tracking-[0.2em] text-chocolate">Torino Dessert</p>
          <h1 className="font-display text-3xl font-semibold text-ink">Admin sign in</h1>
          <p className="mt-2 text-sm text-muted">Sign in to manage your store.</p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label className="text-sm font-medium text-ink" htmlFor="email">Email address</label>
            <input
              autoComplete="email"
              className="mt-2 w-full rounded-2xl border border-cream-dark bg-white px-4 py-3 text-ink"
              id="email"
              type="email"
              {...register("email")}
            />
            {errors.email && <p className="mt-1 text-sm text-velvet" role="alert">{errors.email.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-ink" htmlFor="password">Password</label>
            <input
              autoComplete="current-password"
              className="mt-2 w-full rounded-2xl border border-cream-dark bg-white px-4 py-3 text-ink"
              id="password"
              type="password"
              {...register("password")}
            />
            {errors.password && <p className="mt-1 text-sm text-velvet" role="alert">{errors.password.message}</p>}
          </div>
          {submitError && <p className="rounded-2xl bg-velvet/5 px-4 py-3 text-sm text-velvet" role="alert">{submitError}</p>}
          <button
            className="w-full rounded-2xl bg-velvet px-5 py-3 font-semibold text-white transition hover:bg-velvet-dark disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
