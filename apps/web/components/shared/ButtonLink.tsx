import Link from "next/link";
import type { ReactNode } from "react";

export default function ButtonLink({
  children,
  href,
  variant = "primary",
  className = "",
  prefetch,
}: {
  children: ReactNode;
  href: string;
  variant?: "primary" | "outline" | "ghost" | "dark" | "white";
  className?: string;
  prefetch?: boolean;
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-black uppercase tracking-widest transition-all active:scale-[0.98] rounded-none";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 px-8 py-2.5 text-xs font-black tracking-widest",
    outline:
      "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-12 py-5 text-sm font-black tracking-widest",
    ghost:
      "text-slate-900 hover:bg-slate-50 px-6 py-3 text-xs border-b-2 border-transparent hover:border-blue-600",
    dark: "bg-slate-900 text-white hover:bg-slate-800 px-12 py-5 text-sm font-black tracking-widest",
    white: "bg-white text-blue-600 hover:bg-slate-50 px-12 py-5 text-sm font-black tracking-widest",
  } as const;

  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      <span className="flex items-center gap-3">{children}</span>
    </Link>
  );
}
