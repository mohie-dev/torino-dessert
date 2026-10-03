type BrandLockupProps = {
  variant?: "light" | "dark";
  className?: string;
  iconSize?: "small" | "large";
};

export function BrandLockup({
  variant = "light",
  className = "",
  iconSize = "small",
}: BrandLockupProps) {
  const inkClass = variant === "dark" ? "text-white" : "text-chocolate-dark";
  const mutedClass = variant === "dark" ? "text-white/65" : "text-chocolate-light";
  const iconClass = iconSize === "large" ? "size-14" : "size-11";

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        aria-hidden="true"
        className={`${iconClass} shrink-0`}
        fill="none"
        viewBox="0 0 56 56"
      >
        <circle cx="28" cy="28" r="25.5" className="stroke-current" strokeWidth="1.2" />
        <circle cx="28" cy="28" r="21.5" className="stroke-current opacity-35" strokeWidth="0.7" />
        <path
          className="stroke-current"
          d="M17 15.5h22M28 15.5v26m-5.5 0h11M25 21l3-4 3 4m-7.5 4.5c0 4.2 2 7.2 4.5 8.5 2.5-1.3 4.5-4.3 4.5-8.5M28 23v15"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.25"
        />
      </svg>
      <span className="min-w-0 leading-none">
        <span
          className={`block font-display text-[1.8rem] font-bold tracking-[0.025em] ${inkClass}`}
        >
          Torino
        </span>
        <span
          className={`mt-1.5 block whitespace-nowrap text-[8px] font-medium uppercase tracking-[0.2em] ${mutedClass}`}
        >
          Patisserie &amp; Chocolaterie
        </span>
      </span>
    </span>
  );
}
