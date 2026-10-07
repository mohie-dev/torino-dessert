"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, ImagePlus, LoaderCircle, Pencil, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { AccessNotice, DataError } from "@/components/admin/admin-feedback";
import { useAuth } from "@/contexts/auth-context";
import {
  archiveProduct,
  createCategory,
  createProduct,
  createTag,
  deleteTag,
  deactivateCategory,
  fetchAdminCategories,
  fetchAdminProducts,
  fetchTags,
  getProductImageUrl,
  restoreProduct,
  toggleProductAvailability,
  updateCategory,
  updateProduct,
  uploadProductImages,
  type Category,
  type Product,
  type Tag,
} from "@/lib/store-api";
import { formatCurrency } from "@/lib/format";
import {
  categorySchema,
  productSchema,
  tagSchema,
  type CategoryInput,
  type CategoryValues,
  type ProductInput,
  type ProductValues,
  type TagInput,
  type TagValues,
} from "@/schemas/api-schemas";
import { useUIStore } from "@/stores/ui-store";

const inputClass =
  "mt-2 w-full rounded-xl border border-cream-dark bg-white px-3.5 py-2.5 text-sm text-ink";

export default function AdminProductsPage() {
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const notify = useUIStore((state) => state.notify);
  const [archived, setArchived] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [tagColor, setTagColor] = useState("#A41C23");
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    action: () => void;
  } | null>(null);

  const canRead = hasPermission("products:read");
  const canCreate = hasPermission("products:create");
  const canUpdate = hasPermission("products:update");
  const canDelete = hasPermission("products:delete");
  const editingCategoryId =
    editingProduct?.categoryId || editingProduct?.category?.id;

  const productsQuery = useQuery({
    queryKey: ["admin", "products", { archived, search, categoryFilter, page }],
    queryFn: () =>
      fetchAdminProducts({
        isArchived: archived,
        search: search || undefined,
        categoryId: categoryFilter || undefined,
        page,
        limit: 20,
      }),
    enabled: canRead,
  });
  const categoriesQuery = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: fetchAdminCategories,
    enabled: canRead,
  });
  const tagsQuery = useQuery({
    queryKey: ["admin", "tags"],
    queryFn: fetchTags,
    enabled: canRead,
  });

  const productMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id?: string;
      values: ProductValues;
    }) =>
      id
        ? updateProduct(id, values)
        : createProduct(values),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      await queryClient.invalidateQueries({ queryKey: ["storefront", "products"] });
      notify("success", variables.id ? "Product updated." : "Product created.");
      closeProductDialog();
    },
    onError: (error) =>
      notify("error", error instanceof Error ? error.message : "Could not save product."),
  });

  const categoryMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id?: string;
      values: CategoryValues;
    }) => (id ? updateCategory(id, values) : createCategory(values)),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      await queryClient.invalidateQueries({ queryKey: ["storefront", "categories"] });
      notify("success", variables.id ? "Category updated." : "Category created.");
      closeCategoryDialog();
    },
    onError: (error) =>
      notify("error", error instanceof Error ? error.message : "Could not save category."),
  });
  const tagMutation = useMutation({
    mutationFn: (values: TagValues) => createTag(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "tags"] });
      await queryClient.invalidateQueries({ queryKey: ["storefront", "products"] });
      notify("success", "Product tag created.");
      tagForm.reset({ name: "", colorHex: tagColor });
    },
    onError: (error) =>
      notify("error", error instanceof Error ? error.message : "Could not create tag."),
  });

  const product = useForm<ProductInput, unknown, ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      images: [],
      tagIds: [],
      isAvailable: true,
      categoryId: "",
    },
  });
  const productImages = useFieldArray({ control: product.control, name: "images" });
  const category = useForm<CategoryInput, unknown, CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "", isActive: true },
  });
  const tagForm = useForm<TagInput, unknown, TagValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: { name: "", colorHex: tagColor },
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    category.reset(
      editingCategory
        ? {
            name: editingCategory.name,
            description: editingCategory.description ?? "",
            isActive: editingCategory.isActive,
          }
        : { name: "", description: "", isActive: true },
    );
  }, [editingCategory, category]);

  async function refreshCatalog() {
    await queryClient.invalidateQueries({ queryKey: ["storefront", "products"] });
  }

  function openProductDialog(productToEdit: Product | null) {
    product.reset(
      productToEdit
        ? {
            name: productToEdit.name,
            description: productToEdit.description ?? "",
            price: Number(productToEdit.price),
            images: (productToEdit.images ?? []).map((image, index) => ({
              url: image.url,
              altText: image.altText ?? "",
              sortOrder: image.sortOrder ?? index,
            })),
            tagIds: (productToEdit.tags ?? []).map((tag) => tag.id),
            isAvailable: productToEdit.isAvailable,
            categoryId:
              productToEdit.categoryId || productToEdit.category?.id || "",
          }
        : {
            name: "",
            description: "",
            price: 0,
            images: [],
            tagIds: [],
            isAvailable: true,
            categoryId: "",
          },
    );
    setEditingProduct(productToEdit);
    setProductDialogOpen(true);
  }

  function submitProduct(values: ProductValues) {
    const categoryId = values.categoryId.trim();
    if (!categoryId) {
      product.setError("categoryId", {
        type: "validate",
        message: "Choose a category.",
      });
      return;
    }

    const payload: ProductValues = {
      name: values.name,
      description: values.description,
      price: values.price,
      images: values.images.map((image, index) => ({
        ...image,
        altText: image.altText?.trim() || undefined,
        sortOrder: index,
      })),
      tagIds: values.tagIds,
      isAvailable: values.isAvailable,
      categoryId,
    };
    productMutation.mutate({ id: editingProduct?.id, values: payload });
  }

  function handleInvalidProductSubmit() {
    notify("error", "Please correct the highlighted fields before saving.");
  }

  function closeProductDialog() {
    setProductDialogOpen(false);
    setEditingProduct(null);
  }

  function closeCategoryDialog() {
    setCategoryDialogOpen(false);
    setEditingCategory(null);
  }

  function askThenRun(
    title: string,
    message: string,
    confirmLabel: string,
    action: () => void,
  ) {
    setConfirmation({ title, message, confirmLabel, action });
  }

  if (!canRead) {
    return <AccessNotice message="You don’t have permission to view products." />;
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-chocolate-light">Your dessert counter</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-ink">Products & categories</h1>
          <p className="mt-2 text-sm text-muted">Manage product details, availability, photos, and menu categories.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canCreate && (
            <>
              <button
                className="inline-flex items-center gap-2 rounded-full border border-chocolate/20 bg-white px-4 py-2.5 text-sm font-semibold text-chocolate hover:bg-cream"
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryDialogOpen(true);
                }}
                type="button"
              >
                <Plus size={16} /> Add category
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-full bg-velvet px-4 py-2.5 text-sm font-semibold text-white hover:bg-velvet-dark"
                onClick={() => openProductDialog(null)}
                type="button"
              >
                <Plus size={16} /> Add product
              </button>
            </>
          )}
        </div>
      </div>

      <section className="mt-7 rounded-3xl border border-[#eee7df] bg-surface p-4 shadow-card">
        <div className="flex flex-col gap-3 lg:flex-row">
          <form
            className="flex flex-1 gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
              setSearch(searchInput.trim());
            }}
          >
            <label className="relative flex-1">
              <span className="sr-only">Search product name</span>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={17} />
              <input
                className="h-11 w-full rounded-xl border border-cream-dark bg-white pl-10 pr-3 text-sm"
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search products"
                value={searchInput}
              />
            </label>
            <button className="rounded-xl bg-chocolate px-4 text-sm font-semibold text-white hover:bg-chocolate-dark" type="submit">Search</button>
          </form>
          <select
            aria-label="Filter by category"
            className="h-11 min-w-44 rounded-xl border border-cream-dark bg-white px-3 text-sm text-ink"
            onChange={(event) => {
              setPage(1);
              setCategoryFilter(event.target.value);
            }}
            value={categoryFilter}
          >
            <option value="">All categories</option>
            {categoriesQuery.data?.filter((item) => item.isActive).map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <div aria-label="Product status filter" className="inline-flex rounded-xl bg-cream p-1">
            <button
              aria-pressed={!archived}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${!archived ? "bg-white text-chocolate shadow-sm" : "text-muted"}`}
              onClick={() => { setPage(1); setArchived(false); }}
              type="button"
            >
              Active
            </button>
            <button
              aria-pressed={archived}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${archived ? "bg-white text-chocolate shadow-sm" : "text-muted"}`}
              onClick={() => { setPage(1); setArchived(true); }}
              type="button"
            >
              Archived
            </button>
          </div>
        </div>
      </section>

      {productsQuery.isError && <DataError onRetry={() => void productsQuery.refetch()} />}

      <section className="mt-5 overflow-hidden rounded-3xl border border-[#eee7df] bg-surface shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#eee7df] bg-[#fcfaf7] text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-4 font-semibold">Product</th>
                <th className="px-5 py-4 font-semibold">Category</th>
                <th className="px-5 py-4 font-semibold">Price</th>
                <th className="px-5 py-4 font-semibold">Availability</th>
                <th className="px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ebe5]">
              {productsQuery.isLoading ? (
                Array.from({ length: 5 }, (_, index) => (
                  <tr key={index}>{Array.from({ length: 5 }, (_, cell) => (
                    <td className="px-5 py-5" key={cell}><span className="block h-5 animate-pulse rounded bg-cream" /></td>
                  ))}</tr>
                ))
              ) : productsQuery.data?.data.length ? (
                productsQuery.data.data.map((item) => (
                  <tr className="text-sm" key={item.id}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-cream">
                          {getProductImageUrl(item) ? (
                            <img alt="" className="h-full w-full object-cover" decoding="async" loading="lazy" referrerPolicy="no-referrer" src={getProductImageUrl(item) ?? undefined} />
                          ) : <span className="grid h-full place-items-center font-display text-xl text-chocolate/50">T</span>}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{item.name}</p>
                          <p className="mt-1 max-w-xs truncate text-xs text-muted">{item.description || "No description"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted">{categoriesQuery.data?.find((category) => category.id === item.categoryId)?.name ?? item.category?.name ?? "—"}</td>
                    <td className="px-5 py-4 font-semibold text-chocolate">{formatCurrency(item.price)}</td>
                    <td className="px-5 py-4">
                      {!archived && canUpdate ? (
                        <button
                          aria-pressed={item.isAvailable}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${item.isAvailable ? "bg-emerald-100 text-emerald-900" : "bg-gray-100 text-gray-700"}`}
                          onClick={() => {
                            void toggleProductAvailability(item.id)
                              .then(async () => {
                                await queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
                                await refreshCatalog();
                              })
                              .catch((error: unknown) => notify("error", error instanceof Error ? error.message : "Availability could not be updated."));
                          }}
                          type="button"
                        >
                          {item.isAvailable ? "Available" : "Unavailable"}
                        </button>
                      ) : (
                        <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${item.isAvailable && !archived ? "bg-emerald-100 text-emerald-900" : "bg-gray-100 text-gray-700"}`}>
                          {archived ? "Archived" : item.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        {archived ? canUpdate && (
                          <button
                            aria-label={`Restore ${item.name}`}
                            className="grid size-9 place-items-center rounded-xl text-chocolate hover:bg-cream"
                            onClick={() => {
                              void restoreProduct(item.id)
                                .then(async () => {
                                  await queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
                                  await refreshCatalog();
                                  notify("success", "Product restored.");
                                })
                                .catch((error: unknown) => notify("error", error instanceof Error ? error.message : "Product could not be restored."));
                            }}
                            type="button"
                          >
                            <RotateCcw size={16} />
                          </button>
                        ) : (
                          <>
                            {canUpdate && (
                              <button
                                aria-label={`Edit ${item.name}`}
                                className="grid size-9 place-items-center rounded-xl text-chocolate hover:bg-cream"
                                onClick={() => openProductDialog(item)}
                                type="button"
                              >
                                <Pencil size={16} />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                aria-label={`Archive ${item.name}`}
                                className="grid size-9 place-items-center rounded-xl text-velvet hover:bg-velvet/5"
                                onClick={() => askThenRun(
                                  "Archive product?",
                                  `Customers will no longer be able to order “${item.name}”.`,
                                  "Archive product",
                                  () => {
                                    void archiveProduct(item.id)
                                      .then(async () => {
                                        await queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
                                        await refreshCatalog();
                                        notify("success", "Product archived.");
                                      })
                                      .catch((error: unknown) => notify("error", error instanceof Error ? error.message : "Product could not be archived."));
                                  },
                                )}
                                type="button"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : !productsQuery.isError ? (
                <tr><td className="px-6 py-16 text-center text-sm text-muted" colSpan={5}>{archived ? "No archived products." : "No products found."}</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#eee7df] px-5 py-4 text-sm">
          <span className="text-muted">
            Page {productsQuery.data?.meta.page ?? page} of {Math.max(productsQuery.data?.meta.totalPages ?? 0, 1)}
          </span>
          <div className="flex gap-2">
            <button
              className="rounded-xl border border-cream-dark px-4 py-2 text-chocolate disabled:opacity-40"
              disabled={page <= 1 || productsQuery.isFetching}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              type="button"
            >
              Previous
            </button>
            <button
              className="rounded-xl border border-cream-dark px-4 py-2 text-chocolate disabled:opacity-40"
              disabled={!productsQuery.data || page >= productsQuery.data.meta.totalPages || productsQuery.isFetching}
              onClick={() => setPage((current) => current + 1)}
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-[#eee7df] bg-surface p-5 shadow-card sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">Categories</h2>
            <p className="mt-1 text-sm text-muted">Organize products into menu sections.</p>
          </div>
          {canCreate && (
            <button
              className="inline-flex items-center gap-2 rounded-full border border-chocolate/20 px-4 py-2 text-sm font-semibold text-chocolate hover:bg-cream"
              onClick={() => {
                setEditingCategory(null);
                setCategoryDialogOpen(true);
              }}
              type="button"
            >
              <Plus size={15} /> Add category
            </button>
          )}
        </div>
        {categoriesQuery.isError && <DataError onRetry={() => void categoriesQuery.refetch()} />}
        {categoriesQuery.isLoading ? (
          <div className="mt-5 h-20 animate-pulse rounded-2xl bg-cream" />
        ) : categoriesQuery.data?.length ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {categoriesQuery.data.map((item) => (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-cream-dark/80 bg-white p-4" key={item.id}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                  <p className="mt-1 text-xs text-muted">{item.isActive ? "Active category" : "Inactive category"}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {canUpdate && (
                    <button
                      aria-label={`Edit ${item.name} category`}
                      className="grid size-8 place-items-center rounded-lg text-chocolate hover:bg-cream"
                      onClick={() => {
                        setEditingCategory(item);
                        setCategoryDialogOpen(true);
                      }}
                      type="button"
                    >
                      <Pencil size={15} />
                    </button>
                  )}
                  {item.isActive && canDelete && (
                    <button
                      aria-label={`Deactivate ${item.name} category`}
                      className="grid size-8 place-items-center rounded-lg text-velvet hover:bg-velvet/5"
                      onClick={() => askThenRun(
                        "Deactivate category?",
                        `Products in “${item.name}” will no longer be shown in the storefront.`,
                        "Deactivate category",
                        () => {
                          void deactivateCategory(item.id)
                            .then(async () => {
                              await queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
                              await queryClient.invalidateQueries({ queryKey: ["storefront", "categories"] });
                              notify("success", "Category deactivated.");
                            })
                            .catch((error: unknown) => notify("error", error instanceof Error ? error.message : "Category could not be deactivated."));
                        },
                      )}
                      type="button"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="mt-8 rounded-3xl border border-[#eee7df] bg-surface p-5 shadow-card sm:p-7">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Product tags</h2>
          <p className="mt-1 text-sm text-muted">Highlight menu items with labels such as bestseller, seasonal, or new.</p>
        </div>
        {canCreate && (
          <form
            className="mt-5 flex flex-col gap-3 rounded-2xl bg-cream/60 p-4 sm:flex-row sm:items-end"
            onSubmit={tagForm.handleSubmit((values) => tagMutation.mutate(values))}
            noValidate
          >
            <label className="flex-1 text-sm font-medium text-ink">
              Tag name
              <input
                className={inputClass}
                maxLength={50}
                placeholder="e.g. Bestseller"
                {...tagForm.register("name")}
              />
              {tagForm.formState.errors.name && (
                <span className="mt-1 block text-xs text-velvet">{tagForm.formState.errors.name.message}</span>
              )}
            </label>
            <label className="text-sm font-medium text-ink">
              Tag color
              <span className="mt-2 flex h-11 items-center gap-2 rounded-xl border border-cream-dark bg-white px-3">
                <input
                  aria-label="Tag color"
                  className="size-7 cursor-pointer rounded border-0 bg-transparent p-0"
                  onChange={(event) => {
                    setTagColor(event.target.value);
                    tagForm.setValue("colorHex", event.target.value, { shouldValidate: true });
                  }}
                  type="color"
                  value={tagColor}
                />
                <span className="text-xs font-medium uppercase text-muted">{tagColor}</span>
              </span>
              {tagForm.formState.errors.colorHex && (
                <span className="mt-1 block text-xs text-velvet">{tagForm.formState.errors.colorHex.message}</span>
              )}
            </label>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-chocolate px-4 text-sm font-semibold text-white hover:bg-chocolate-dark disabled:opacity-50"
              disabled={tagMutation.isPending}
              type="submit"
            >
              {tagMutation.isPending ? <LoaderCircle className="animate-spin" size={16} /> : <Plus size={16} />}
              Create tag
            </button>
          </form>
        )}
        {tagsQuery.isError && <DataError onRetry={() => void tagsQuery.refetch()} />}
        {tagsQuery.isLoading ? (
          <div className="mt-5 h-16 animate-pulse rounded-2xl bg-cream" />
        ) : tagsQuery.data?.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {tagsQuery.data.map((tag) => (
              <div
                className="inline-flex items-center gap-2 rounded-full border border-cream-dark bg-white py-1.5 pl-3 pr-1.5"
                key={tag.id}
              >
                <span className="size-2.5 rounded-full" style={{ backgroundColor: tag.colorHex ?? "#7A4016" }} />
                <span className="text-sm font-medium text-ink">{tag.name}</span>
                {canDelete && (
                  <button
                    aria-label={`Delete ${tag.name} tag`}
                    className="grid size-7 place-items-center rounded-full text-muted hover:bg-velvet/10 hover:text-velvet"
                    onClick={() =>
                      askThenRun(
                        "Delete product tag?",
                        `“${tag.name}” will be removed from all products using it.`,
                        "Delete tag",
                        () => {
                          void deleteTag(tag.id)
                            .then(async () => {
                              await queryClient.invalidateQueries({ queryKey: ["admin", "tags"] });
                              await queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
                              await queryClient.invalidateQueries({ queryKey: ["storefront", "products"] });
                              notify("success", "Product tag deleted.");
                            })
                            .catch((error: unknown) =>
                              notify("error", error instanceof Error ? error.message : "Product tag could not be deleted."),
                            );
                        },
                      )
                    }
                    type="button"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-2xl bg-cream/60 px-4 py-3 text-sm text-muted">No product tags yet.</p>
        )}
        {!canCreate && (
          <p className="mt-3 text-xs text-muted">Creating tags requires product-create permission.</p>
        )}
      </section>

      {productDialogOpen && (
        <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-ink/50 p-4" role="presentation">
          <section aria-labelledby="product-dialog-title" aria-modal="true" className="my-8 max-h-[calc(100vh-4rem)] w-full max-w-2xl overflow-y-auto rounded-3xl bg-surface p-5 shadow-elevated sm:p-8" role="dialog">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-chocolate-light">{editingProduct ? "Update menu item" : "New menu item"}</p>
                <h2 className="mt-1 font-display text-3xl font-semibold text-ink" id="product-dialog-title">{editingProduct ? "Edit product" : "Add product"}</h2>
              </div>
              <button aria-label="Close dialog" className="rounded-lg px-3 py-2 text-muted hover:bg-cream" onClick={closeProductDialog} type="button">✕</button>
            </div>

            <form
              className="mt-6 space-y-4"
              onSubmit={product.handleSubmit(
                submitProduct,
                handleInvalidProductSubmit,
              )}
              noValidate
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-ink sm:col-span-2">
                  Product name
                  <input className={inputClass} maxLength={150} {...product.register("name")} />
                  {product.formState.errors.name && <span className="mt-1 block text-xs text-velvet">{product.formState.errors.name.message}</span>}
                </label>
                <label className="text-sm font-medium text-ink">
                  Price
                  <input className={inputClass} min="0" step="0.01" type="number" {...product.register("price", { valueAsNumber: true })} />
                  {product.formState.errors.price && <span className="mt-1 block text-xs text-velvet">{product.formState.errors.price.message}</span>}
                </label>
                <label className="text-sm font-medium text-ink">
                  Category
                  <select
                    className={inputClass}
                    disabled={categoriesQuery.isLoading || categoriesQuery.isError}
                    {...product.register("categoryId")}
                  >
                    <option value="">Choose category</option>
                    {editingCategoryId &&
                      !categoriesQuery.data?.some(
                        (item) =>
                          item.id === editingCategoryId && item.isActive,
                      ) && (
                        <option value={editingCategoryId}>
                          {categoriesQuery.data?.find(
                            (item) => item.id === editingCategoryId,
                          )?.name ??
                            editingProduct?.category?.name ??
                            "Current category"} (inactive)
                        </option>
                      )}
                    {categoriesQuery.data
                      ?.filter((item) => item.isActive)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                  {product.formState.errors.categoryId && <span className="mt-1 block text-xs text-velvet">{product.formState.errors.categoryId.message}</span>}
                  {categoriesQuery.isError && (
                    <button
                      className="mt-1 block text-xs font-semibold text-velvet underline"
                      onClick={() => void categoriesQuery.refetch()}
                      type="button"
                    >
                      Could not load categories. Retry
                    </button>
                  )}
                </label>
                <label className="text-sm font-medium text-ink sm:col-span-2">
                  Description <span className="font-normal text-muted">(optional)</span>
                  <textarea className={`${inputClass} min-h-20 resize-y`} {...product.register("description")} />
                </label>
                <div className="space-y-3 sm:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-ink">Product photos</h3>
                      <p className="mt-1 text-xs text-muted">Add up to 10 photos. The first photo is shown on the menu.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="inline-flex items-center gap-2 rounded-xl border border-cream-dark px-3 py-2 text-xs font-semibold text-chocolate hover:bg-cream disabled:opacity-50"
                        disabled={productImages.fields.length >= 10}
                        onClick={() =>
                          productImages.append({
                            url: "",
                            altText: "",
                            sortOrder: productImages.fields.length,
                          })
                        }
                        type="button"
                      >
                        <Plus size={14} /> Add image URL
                      </button>
                      <label className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-cream-dark px-3 py-2 text-xs font-semibold text-chocolate hover:bg-cream ${!canCreate || uploading || productImages.fields.length >= 10 ? "cursor-not-allowed opacity-50" : ""}`}>
                        {uploading ? <LoaderCircle className="animate-spin" size={15} /> : <ImagePlus size={15} />}
                        {uploading ? "Uploading…" : "Upload photos"}
                        <input
                          accept="image/png,image/jpeg,image/webp"
                          className="sr-only"
                          disabled={!canCreate || uploading || productImages.fields.length >= 10}
                          multiple
                          onChange={async (event) => {
                            const files = Array.from(event.target.files ?? []);
                            event.target.value = "";
                            if (!files.length) return;
                            if (productImages.fields.length + files.length > 10) {
                              notify("error", "A product can have up to 10 photos.");
                              return;
                            }
                            const oversized = files.find((file) => file.size > 5 * 1024 * 1024);
                            if (oversized) {
                              notify("error", `${oversized.name} is larger than 5 MB.`);
                              return;
                            }
                            setUploading(true);
                            try {
                              const urls = await uploadProductImages(files);
                              if (urls.length !== files.length) {
                                throw new Error("The server did not return a URL for every uploaded photo.");
                              }
                              urls.forEach((url, index) =>
                                productImages.append({
                                  url,
                                  altText: "",
                                  sortOrder: productImages.fields.length + index,
                                }),
                              );
                              notify("success", `${urls.length} photo${urls.length === 1 ? "" : "s"} uploaded.`);
                            } catch (error) {
                              notify("error", error instanceof Error ? error.message : "Photo upload failed.");
                            } finally {
                              setUploading(false);
                            }
                          }}
                          type="file"
                        />
                      </label>
                    </div>
                  </div>
                  {!canCreate && (
                    <p className="text-xs text-muted">Photo uploads require product-create permission in the current API.</p>
                  )}
                  {product.formState.errors.images?.root?.message && (
                    <p className="text-xs text-velvet">{product.formState.errors.images.root.message}</p>
                  )}
                  {productImages.fields.length > 0 && (
                    <div className="space-y-3">
                      {productImages.fields.map((field, index) => (
                        <div className="grid gap-3 rounded-2xl border border-cream-dark bg-white p-3 sm:grid-cols-[76px_minmax(0,1fr)_auto]" key={field.id}>
                          <div className="aspect-square overflow-hidden rounded-xl bg-cream">
                            {product.watch(`images.${index}.url`) ? (
                              <img
                                alt=""
                                className="h-full w-full object-cover"
                                src={product.watch(`images.${index}.url`)}
                              />
                            ) : (
                              <span className="grid h-full place-items-center text-xs text-muted">Preview</span>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-medium text-ink">
                              Image URL
                              <input
                                className="mt-1 w-full rounded-lg border border-cream-dark px-3 py-2 text-xs"
                                placeholder="https://…"
                                type="url"
                                {...product.register(`images.${index}.url`)}
                              />
                              {product.formState.errors.images?.[index]?.url && (
                                <span className="mt-1 block text-xs text-velvet">
                                  {product.formState.errors.images[index]?.url?.message}
                                </span>
                              )}
                            </label>
                            <label className="block text-xs font-medium text-ink">
                              Accessibility description <span className="font-normal text-muted">(optional)</span>
                              <input
                                className="mt-1 w-full rounded-lg border border-cream-dark px-3 py-2 text-xs"
                                maxLength={150}
                                placeholder="Describe the photo"
                                {...product.register(`images.${index}.altText`)}
                              />
                            </label>
                          </div>
                          <div className="flex items-start justify-end gap-1">
                            <button
                              aria-label={`Move photo ${index + 1} up`}
                              className="grid size-8 place-items-center rounded-lg text-chocolate hover:bg-cream disabled:opacity-30"
                              disabled={index === 0}
                              onClick={() => productImages.swap(index, index - 1)}
                              type="button"
                            >
                              <ArrowUp size={15} />
                            </button>
                            <button
                              aria-label={`Move photo ${index + 1} down`}
                              className="grid size-8 place-items-center rounded-lg text-chocolate hover:bg-cream disabled:opacity-30"
                              disabled={index === productImages.fields.length - 1}
                              onClick={() => productImages.swap(index, index + 1)}
                              type="button"
                            >
                              <ArrowDown size={15} />
                            </button>
                            <button
                              aria-label={`Remove photo ${index + 1}`}
                              className="grid size-8 place-items-center rounded-lg text-velvet hover:bg-velvet/5"
                              onClick={() => productImages.remove(index)}
                              type="button"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <fieldset className="space-y-2 sm:col-span-2">
                  <legend className="text-sm font-semibold text-ink">Tags</legend>
                  {tagsQuery.isError ? (
                    <button
                      className="text-xs font-semibold text-velvet underline"
                      onClick={() => void tagsQuery.refetch()}
                      type="button"
                    >
                      Could not load tags. Retry
                    </button>
                  ) : tagsQuery.data?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {tagsQuery.data.map((tag: Tag) => {
                        const selectedTags = product.watch("tagIds") ?? [];
                        return (
                          <label
                            className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                              selectedTags.includes(tag.id)
                                ? "border-chocolate/30 bg-cream text-chocolate"
                                : "border-cream-dark bg-white text-muted hover:bg-cream/50"
                            }`}
                            key={tag.id}
                          >
                            <input
                              className="size-3.5 accent-velvet"
                              type="checkbox"
                              value={tag.id}
                              {...product.register("tagIds")}
                            />
                            <span className="size-2.5 rounded-full" style={{ backgroundColor: tag.colorHex ?? "#7A4016" }} />
                            {tag.name}
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted">Create tags above to add them to products.</p>
                  )}
                </fieldset>
                <label className="flex items-center gap-3 rounded-xl bg-cream/70 px-4 py-3 text-sm font-medium text-ink sm:col-span-2">
                  <input className="size-4 accent-velvet" type="checkbox" {...product.register("isAvailable")} />
                  Available to order
                </label>
              </div>
              <div className="flex justify-end gap-3 border-t border-[#eee7df] pt-5">
                <button className="rounded-full px-5 py-2.5 text-sm font-semibold text-chocolate hover:bg-cream" onClick={closeProductDialog} type="button">Cancel</button>
                <button className="rounded-full bg-velvet px-6 py-2.5 text-sm font-semibold text-white hover:bg-velvet-dark disabled:cursor-not-allowed disabled:opacity-50" disabled={productMutation.isPending || uploading} type="submit">
                  {productMutation.isPending ? "Saving…" : editingProduct ? "Save changes" : "Create product"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {categoryDialogOpen && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-ink/50 p-4" role="presentation">
          <section aria-labelledby="category-dialog-title" aria-modal="true" className="w-full max-w-lg rounded-3xl bg-surface p-5 shadow-elevated sm:p-8" role="dialog">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-chocolate-light">{editingCategory ? "Edit menu section" : "Organize your menu"}</p>
                <h2 className="mt-1 font-display text-3xl font-semibold text-ink" id="category-dialog-title">{editingCategory ? "Edit category" : "Add category"}</h2>
              </div>
              <button aria-label="Close dialog" className="rounded-lg px-3 py-2 text-muted hover:bg-cream" onClick={closeCategoryDialog} type="button">✕</button>
            </div>
            <form
              className="mt-6 space-y-4"
              onSubmit={category.handleSubmit((values) => categoryMutation.mutate({ id: editingCategory?.id, values }))}
              noValidate
            >
              <label className="block text-sm font-medium text-ink">
                Category name
                <input className={inputClass} maxLength={100} {...category.register("name")} />
                {category.formState.errors.name && <span className="mt-1 block text-xs text-velvet">{category.formState.errors.name.message}</span>}
              </label>
              <label className="block text-sm font-medium text-ink">
                Description <span className="font-normal text-muted">(optional)</span>
                <textarea className={`${inputClass} min-h-24 resize-y`} {...category.register("description")} />
              </label>
              {editingCategory && (
                <label className="flex items-center gap-3 rounded-xl bg-cream/70 px-4 py-3 text-sm font-medium text-ink">
                  <input className="size-4 accent-velvet" type="checkbox" {...category.register("isActive")} />
                  Category is active
                </label>
              )}
              <div className="flex justify-end gap-3 border-t border-[#eee7df] pt-5">
                <button className="rounded-full px-5 py-2.5 text-sm font-semibold text-chocolate hover:bg-cream" onClick={closeCategoryDialog} type="button">Cancel</button>
                <button className="rounded-full bg-velvet px-6 py-2.5 text-sm font-semibold text-white hover:bg-velvet-dark disabled:opacity-50" disabled={categoryMutation.isPending} type="submit">
                  {categoryMutation.isPending ? "Saving…" : editingCategory ? "Save category" : "Create category"}
                </button>
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
