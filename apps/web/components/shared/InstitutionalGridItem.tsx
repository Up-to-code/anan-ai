"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InstitutionalGridItemProps {
  href: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  className?: string;
}

export default function InstitutionalGridItem({
  href,
  label,
  description,
  icon: Icon,
  className,
}: InstitutionalGridItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col justify-between border-2 border-slate-100 bg-white p-6 transition-all duration-200 hover:border-blue-600 rounded-none shadow-none",
        className
      )}
    >
      <div className="flex w-full items-start justify-between">
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-black uppercase tracking-[0.15em] text-slate-900 group-hover:text-blue-600 transition-colors">
            {label}
          </h3>
          {description && (
            <p className="text-[10px] font-bold leading-relaxed text-slate-400">
              {description}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-100 transition-colors group-hover:text-blue-600">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Link>
  );
}
