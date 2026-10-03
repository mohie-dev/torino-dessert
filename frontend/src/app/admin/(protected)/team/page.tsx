"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Pencil, Plus, ShieldCheck, Trash2, UserRound, UserRoundX } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { AccessNotice, DataError } from "@/components/admin/admin-feedback";
import { useAuth } from "@/contexts/auth-context";
import {
  createRole,
  createStaffUser,
  deleteRole,
  fetchRoles,
  fetchStaffUsers,
  setStaffUserStatus,
  updateRole,
  updateStaffUser,
  type AdminRole,
  type StaffUser,
} from "@/lib/admin-api";
import {
  createUserSchema,
  roleSchema,
  userFormSchema,
  type RoleInput,
  type RoleValues,
  type UpdateUserValues,
  type UserFormValues,
} from "@/schemas/api-schemas";
import { useUIStore } from "@/stores/ui-store";

const permissions = [
  { value: "dashboard:read", label: "View dashboard" },
  { value: "categories:read", label: "Read categories" },
  { value: "categories:create", label: "Create categories" },
  { value: "categories:update", label: "Update categories" },
  { value: "categories:delete", label: "Delete categories" },
  { value: "products:read", label: "Read products" },
  { value: "products:create", label: "Create products" },
  { value: "products:update", label: "Update products" },
  { value: "products:delete", label: "Delete products" },
  { value: "orders:read", label: "Read orders" },
  { value: "orders:create", label: "Create orders" },
  { value: "orders:update", label: "Update orders" },
  { value: "orders:delete", label: "Delete orders" },
  { value: "customers:read", label: "Read customers" },
  { value: "customers:create", label: "Create customers" },
  { value: "customers:update", label: "Update customers" },
  { value: "customers:delete", label: "Delete customers" },
  { value: "users:read", label: "Read users" },
  { value: "users:create", label: "Create users" },
  { value: "users:update", label: "Update users" },
  { value: "users:delete", label: "Delete users" },
  { value: "users:manage", label: "Manage users" },
  { value: "roles:manage", label: "Manage roles" },
  { value: "settings:manage", label: "Manage settings" },
  { value: "reports:read", label: "Read reports" },
] as const;

const fieldClass =
  "mt-2 w-full rounded-xl border border-cream-dark bg-white px-3.5 py-2.5 text-sm text-ink";

export default function AdminTeamPage() {
  const { hasPermission } = useAuth();
  const canManageUsers = hasPermission("users:manage");
  const canManageRoles = hasPermission("roles:manage");
  const queryClient = useQueryClient();
  const notify = useUIStore((state) => state.notify);

  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<AdminRole | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    action: () => void;
  } | null>(null);

  const usersQuery = useQuery({
    queryKey: ["admin", "staff"],
    queryFn: fetchStaffUsers,
    enabled: canManageUsers,
  });
  const rolesQuery = useQuery({
    queryKey: ["admin", "roles"],
    queryFn: fetchRoles,
    enabled: canManageRoles,
  });

  const userMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id?: string;
      values: UserFormValues | UpdateUserValues;
    }) =>
      id
        ? updateStaffUser(id, values)
        : createStaffUser(values),
    onSuccess: async (_, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "staff"] });
      notify("success", id ? "Team member updated." : "Team member created.");
      closeUserDialog();
    },
    onError: (error) =>
      notify("error", error instanceof Error ? error.message : "Could not save team member."),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setStaffUserStatus(id, isActive),
    onSuccess: async (_, { isActive }) => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "staff"] });
      notify("success", isActive ? "Account activated." : "Account deactivated.");
    },
    onError: (error) =>
      notify("error", error instanceof Error ? error.message : "Account status could not be changed."),
  });

  const roleMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id?: string;
      values: RoleValues;
    }) => (id ? updateRole(id, values) : createRole(values)),
    onSuccess: async (_, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "roles"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "staff"] });
      notify("success", id ? "Role updated." : "Role created.");
      closeRoleDialog();
    },
    onError: (error) =>
      notify("error", error instanceof Error ? error.message : "Could not save role."),
  });

  const roleDeleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "roles"] });
      notify("success", "Role deleted.");
    },
    onError: (error) =>
      notify("error", error instanceof Error ? error.message : "Role could not be deleted."),
  });

  const userForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", roleId: "" },
  });
  const roleForm = useForm<RoleInput, unknown, RoleValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: "", permissions: [] },
  });

  useEffect(() => {
    userForm.reset(
      editingUser
        ? {
            firstName: editingUser.firstName,
            lastName: editingUser.lastName ?? "",
            email: editingUser.email,
            password: "",
            roleId: editingUser.roleId ?? editingUser.role?.id ?? "",
          }
        : { firstName: "", lastName: "", email: "", password: "", roleId: "" },
    );
  }, [editingUser, userForm]);

  useEffect(() => {
    roleForm.reset(
      editingRole
        ? { name: editingRole.name, permissions: editingRole.permissions }
        : { name: "", permissions: [] },
    );
  }, [editingRole, roleForm]);

  function closeUserDialog() {
    setUserDialogOpen(false);
    setEditingUser(null);
  }
  function closeRoleDialog() {
    setRoleDialogOpen(false);
    setEditingRole(null);
  }

  if (!canManageUsers && !canManageRoles) {
    return <AccessNotice message="You don’t have permission to manage staff or roles." />;
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-chocolate-light">People and access</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-ink">Team & roles</h1>
          <p className="mt-2 text-sm text-muted">Manage staff accounts and the permissions assigned to each role.</p>
        </div>
        <div className="flex gap-2">
          {canManageRoles && (
            <button className="inline-flex items-center gap-2 rounded-full border border-chocolate/20 bg-white px-4 py-2.5 text-sm font-semibold text-chocolate hover:bg-cream" onClick={() => { setEditingRole(null); setRoleDialogOpen(true); }} type="button">
              <Plus size={15} /> Add role
            </button>
          )}
          {canManageUsers && canManageRoles && (
            <button className="inline-flex items-center gap-2 rounded-full bg-velvet px-4 py-2.5 text-sm font-semibold text-white hover:bg-velvet-dark" onClick={() => { setEditingUser(null); setUserDialogOpen(true); }} type="button">
              <Plus size={15} /> Add team member
            </button>
          )}
        </div>
      </div>

      {canManageUsers && !canManageRoles && (
        <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Staff creation requires role assignment, and the API only allows role listing with <code>roles:manage</code>. You can still update and activate existing accounts.
        </p>
      )}

      {canManageUsers && (
        <section className="mt-7 overflow-hidden rounded-3xl border border-[#eee7df] bg-surface shadow-card">
          <div className="flex items-center justify-between border-b border-[#eee7df] px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-cream text-chocolate"><UserRound size={18} /></span>
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">Team members</h2>
                <p className="text-xs text-muted">{usersQuery.data?.length ?? 0} accounts</p>
              </div>
            </div>
          </div>
          {usersQuery.isError && <div className="px-5"><DataError onRetry={() => void usersQuery.refetch()} /></div>}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead><tr className="bg-[#fcfaf7] text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-semibold">Name</th><th className="px-5 py-3 font-semibold">Email</th><th className="px-5 py-3 font-semibold">Role</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-[#f0ebe5]">
                {usersQuery.isLoading ? (
                  Array.from({ length: 4 }, (_, row) => <tr key={row}>{Array.from({ length: 5 }, (_, cell) => <td className="px-5 py-5" key={cell}><span className="block h-4 animate-pulse rounded bg-cream" /></td>)}</tr>)
                ) : usersQuery.data?.length ? usersQuery.data.map((user) => (
                  <tr className="text-sm" key={user.id}>
                    <td className="px-5 py-4 font-medium text-ink">{user.firstName} {user.lastName}</td>
                    <td className="px-5 py-4 text-muted">{user.email}</td>
                    <td className="px-5 py-4 text-muted">{user.role?.name ?? "Unassigned"}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${user.isActive ? "bg-emerald-100 text-emerald-900" : "bg-gray-100 text-gray-700"}`}>{user.isActive ? "Active" : "Inactive"}</span></td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button aria-label={`Edit ${user.firstName}`} className="grid size-9 place-items-center rounded-xl text-chocolate hover:bg-cream" onClick={() => { setEditingUser(user); setUserDialogOpen(true); }} type="button"><Pencil size={16} /></button>
                        <button
                          aria-label={`${user.isActive ? "Deactivate" : "Activate"} ${user.firstName}`}
                          className={`grid size-9 place-items-center rounded-xl ${user.isActive ? "text-velvet hover:bg-velvet/5" : "text-emerald-800 hover:bg-emerald-50"}`}
                          disabled={statusMutation.isPending}
                          onClick={() => {
                            const nextActiveState = !user.isActive;
                            const fullName = [user.firstName, user.lastName]
                              .filter(Boolean)
                              .join(" ");
                            setConfirmation({
                              title: nextActiveState
                                ? "Activate team member?"
                                : "Deactivate team member?",
                              message: nextActiveState
                                ? `${fullName} will be able to sign in and use their assigned permissions.`
                                : `${fullName} will no longer be able to sign in.`,
                              confirmLabel: nextActiveState ? "Activate account" : "Deactivate account",
                              action: () =>
                                statusMutation.mutate({
                                  id: user.id,
                                  isActive: nextActiveState,
                                }),
                            });
                          }}
                          type="button"
                        >
                          {user.isActive ? <UserRoundX size={16} /> : <UserRound size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : !usersQuery.isError ? (
                  <tr><td className="px-5 py-12 text-center text-sm text-muted" colSpan={5}>No team accounts found.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {canManageRoles && (
        <section className="mt-7 rounded-3xl border border-[#eee7df] bg-surface p-5 shadow-card sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-cream text-chocolate"><KeyRound size={18} /></span>
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Roles & permissions</h2>
              <p className="text-xs text-muted">Permissions are evaluated by the API on every protected request.</p>
            </div>
          </div>
          {rolesQuery.isError && <DataError onRetry={() => void rolesQuery.refetch()} />}
          {rolesQuery.isLoading ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">{[1, 2].map((i) => <div className="h-40 animate-pulse rounded-2xl bg-cream" key={i} />)}</div>
          ) : rolesQuery.data?.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {rolesQuery.data.map((role) => (
                <article className="rounded-2xl border border-cream-dark/80 bg-white p-5" key={role.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-ink">{role.name}</h3>
                      <p className="mt-1 text-xs text-muted">{role.permissions.length} permissions</p>
                    </div>
                    <span className="grid size-9 place-items-center rounded-xl bg-cream text-chocolate"><ShieldCheck size={17} /></span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {role.permissions.slice(0, 5).map((permission) => <span className="rounded-full bg-cream px-2.5 py-1 text-[10px] text-chocolate" key={permission}>{permission}</span>)}
                    {role.permissions.length > 5 && <span className="rounded-full bg-cream px-2.5 py-1 text-[10px] text-chocolate">+{role.permissions.length - 5} more</span>}
                  </div>
                  <div className="mt-4 flex justify-end gap-2 border-t border-[#f0ebe5] pt-3">
                    <button className="rounded-lg px-3 py-2 text-xs font-semibold text-chocolate hover:bg-cream" onClick={() => { setEditingRole(role); setRoleDialogOpen(true); }} type="button">Edit role</button>
                    {role.name !== "Super Admin" && (
                      <button
                        aria-label={`Delete ${role.name} role`}
                        className="grid size-8 place-items-center rounded-lg text-velvet hover:bg-velvet/5"
                        disabled={roleDeleteMutation.isPending}
                        onClick={() => {
                          setConfirmation({
                            title: "Delete role?",
                            message: `Delete “${role.name}”? Roles assigned to users cannot be deleted.`,
                            confirmLabel: "Delete role",
                            action: () => roleDeleteMutation.mutate(role.id),
                          });
                        }}
                        type="button"
                      ><Trash2 size={15} /></button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : !rolesQuery.isError ? <p className="mt-5 text-sm text-muted">No roles configured.</p> : null}
        </section>
      )}

      {userDialogOpen && canManageUsers && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-ink/50 p-4">
          <section aria-labelledby="user-dialog-title" aria-modal="true" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-surface p-5 shadow-elevated sm:p-8" role="dialog">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-chocolate-light">Staff access</p>
              <h2 className="mt-1 font-display text-3xl font-semibold text-ink" id="user-dialog-title">{editingUser ? "Edit team member" : "Add team member"}</h2>
            </div>
            <form
              className="mt-6 space-y-4"
              onSubmit={userForm.handleSubmit((values) => {
                if (editingUser) {
                  const updateValues = { ...values };
                  delete updateValues.password;
                  if (!updateValues.roleId) delete updateValues.roleId;
                  userMutation.mutate({ id: editingUser.id, values: updateValues });
                } else {
                  const parsed = createUserSchema.safeParse(values);
                  if (!parsed.success) {
                    userForm.setError("password", {
                      type: "validate",
                      message: parsed.error.issues.find((issue) => issue.path[0] === "password")?.message ?? "Password is required.",
                    });
                    return;
                  }
                  userMutation.mutate({ values: parsed.data });
                }
              })}
              noValidate
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-ink">First name<input className={fieldClass} {...userForm.register("firstName")} /></label>
                <label className="text-sm font-medium text-ink">Last name<input className={fieldClass} {...userForm.register("lastName")} /></label>
                <label className="text-sm font-medium text-ink sm:col-span-2">Email<input className={fieldClass} type="email" {...userForm.register("email")} /></label>
                {userForm.formState.errors.firstName && <p className="text-xs text-velvet">{userForm.formState.errors.firstName.message}</p>}
                {userForm.formState.errors.email && <p className="text-xs text-velvet">{userForm.formState.errors.email.message}</p>}
                {!editingUser && <label className="text-sm font-medium text-ink sm:col-span-2">Temporary password<input className={fieldClass} autoComplete="new-password" type="password" {...userForm.register("password")} />{userForm.formState.errors.password && <span className="mt-1 block text-xs text-velvet">{userForm.formState.errors.password.message}</span>}</label>}
                <label className="text-sm font-medium text-ink sm:col-span-2">Role
                  <select className={fieldClass} disabled={!canManageRoles} {...userForm.register("roleId")}>
                    <option value="">Choose a role</option>
                    {rolesQuery.data?.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                  </select>
                  {userForm.formState.errors.roleId && <span className="mt-1 block text-xs text-velvet">{userForm.formState.errors.roleId.message}</span>}
                  {rolesQuery.isError && <span className="mt-1 block text-xs text-velvet">Role list could not be loaded.</span>}
                </label>
              </div>
              <div className="flex justify-end gap-3 border-t border-[#eee7df] pt-5">
                <button className="rounded-full px-5 py-2.5 text-sm font-semibold text-chocolate hover:bg-cream" onClick={closeUserDialog} type="button">Cancel</button>
                <button className="rounded-full bg-velvet px-6 py-2.5 text-sm font-semibold text-white hover:bg-velvet-dark disabled:opacity-50" disabled={userMutation.isPending || !canManageRoles || rolesQuery.isError} type="submit">{userMutation.isPending ? "Saving…" : editingUser ? "Save changes" : "Create account"}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {roleDialogOpen && canManageRoles && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-ink/50 p-4">
          <section aria-labelledby="role-dialog-title" aria-modal="true" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-surface p-5 shadow-elevated sm:p-8" role="dialog">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-chocolate-light">Access control</p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-ink" id="role-dialog-title">{editingRole ? "Edit role" : "Create role"}</h2>
            <form className="mt-6" onSubmit={roleForm.handleSubmit((values) => roleMutation.mutate({ id: editingRole?.id, values }))} noValidate>
              <label className="block text-sm font-medium text-ink">Role name
                <input className={fieldClass} maxLength={100} {...roleForm.register("name")} />
                {roleForm.formState.errors.name && <span className="mt-1 block text-xs text-velvet">{roleForm.formState.errors.name.message}</span>}
              </label>
              <fieldset className="mt-6">
                <legend className="text-sm font-semibold text-ink">Permissions</legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {permissions.map((permission) => (
                    <label className="flex items-center gap-2.5 rounded-xl bg-cream/50 px-3 py-2.5 text-xs text-ink" key={permission.value}>
                      <input className="size-4 accent-velvet" type="checkbox" value={permission.value} {...roleForm.register("permissions")} />
                      {permission.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="mt-6 flex justify-end gap-3 border-t border-[#eee7df] pt-5">
                <button className="rounded-full px-5 py-2.5 text-sm font-semibold text-chocolate hover:bg-cream" onClick={closeRoleDialog} type="button">Cancel</button>
                <button className="rounded-full bg-velvet px-6 py-2.5 text-sm font-semibold text-white hover:bg-velvet-dark disabled:opacity-50" disabled={roleMutation.isPending} type="submit">{roleMutation.isPending ? "Saving…" : editingRole ? "Save role" : "Create role"}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {confirmation && (
        <ConfirmationDialog
          confirmLabel={confirmation.confirmLabel}
          message={confirmation.message}
          onCancel={() => setConfirmation(null)}
          onConfirm={() => {
            const { action } = confirmation;
            setConfirmation(null);
            action();
          }}
          title={confirmation.title}
        />
      )}
    </div>
  );
}
