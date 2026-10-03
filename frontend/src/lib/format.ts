export function formatCurrency(amount: number | string): string {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "—";

  return new Intl.NumberFormat("en-EG-u-nu-latn", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 2,
  }).format(value);
}
