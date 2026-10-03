import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(255)
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Password is required.").max(72),
});

const optionalUrl = z
  .union([z.string().trim().url().max(255), z.literal(""), z.null()])
  .optional()
  .transform((value) => (value === "" ? null : value));

const optionalText = (maximum: number) =>
  z
    .union([z.string().max(maximum), z.literal(""), z.null()])
    .optional()
    .transform((value) => (value === "" ? null : value));

export const updateSettingsSchema = z.object({
  storeName: z.string().max(150).optional(),
  phone: optionalText(20),
  whatsapp: optionalText(20),
  facebookUrl: optionalUrl,
  instagramUrl: optionalUrl,
  deliveryFee: z.number().finite().min(0).optional(),
  isOpen: z.boolean().optional(),
});

export const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required.").max(150),
  description: z.string().optional(),
  price: z
    .number()
    .finite()
    .min(0)
    .refine(
      (value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-8,
      "Use at most two decimal places.",
    ),
  imageUrl: z
    .union([z.string().trim().url().max(500), z.literal("")])
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  isAvailable: z.boolean(),
  categoryId: z.string().uuid("Choose a category."),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required.").max(100),
  description: z.string().optional(),
  isActive: z.boolean(),
});

export const createUserSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().optional(),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  roleId: z.string().uuid("Choose a role."),
});

export const userFormSchema = createUserSchema.extend({
  password: z.string().optional(),
  roleId: z.string().optional(),
});

export const updateUserSchema = createUserSchema
  .omit({ password: true })
  .partial();

export const roleSchema = z.object({
  name: z.string().min(1, "Role name is required.").max(100),
  permissions: z.array(z.string()),
});

export const toggleUserStatusSchema = z.object({
  isActive: z.boolean(),
});

const optionalCustomerEmail = z
  .union([z.string().trim().email().max(255), z.literal("")])
  .optional()
  .transform((value) => (value === "" ? undefined : value));

export const createOrderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(1, "Enter your name.").max(100),
    phone: z.string().trim().min(1, "Enter your phone number.").max(20),
    email: optionalCustomerEmail,
  }),
  items: z
    .array(
      z.object({
        productId: z.string().uuid("A cart item is no longer valid."),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1, "Add at least one product to your order."),
  deliveryAddress: z.string().trim().min(1, "Enter your delivery address."),
  notes: z.string().optional(),
  paymentMethod: z.literal("CASH_ON_DELIVERY"),
});

export const checkoutFormSchema = createOrderSchema.omit({ items: true });

export const orderStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELLED",
]);

export type LoginInput = z.input<typeof loginSchema>;
export type LoginValues = z.output<typeof loginSchema>;
export type UpdateSettingsInput = z.input<typeof updateSettingsSchema>;
export type UpdateSettingsValues = z.output<typeof updateSettingsSchema>;
export type ProductInput = z.input<typeof productSchema>;
export type ProductValues = z.output<typeof productSchema>;
export type CategoryInput = z.input<typeof categorySchema>;
export type CategoryValues = z.output<typeof categorySchema>;
export type CreateUserInput = z.input<typeof createUserSchema>;
export type CreateUserValues = z.output<typeof createUserSchema>;
export type UserFormValues = z.output<typeof userFormSchema>;
export type UpdateUserValues = z.output<typeof updateUserSchema>;
export type RoleInput = z.input<typeof roleSchema>;
export type RoleValues = z.output<typeof roleSchema>;
export type CreateOrderInput = z.input<typeof createOrderSchema>;
export type CreateOrderValues = z.output<typeof createOrderSchema>;
export type CheckoutFormInput = z.input<typeof checkoutFormSchema>;
export type CheckoutFormValues = z.output<typeof checkoutFormSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
