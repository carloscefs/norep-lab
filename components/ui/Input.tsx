"use client";

import { cn } from "@/lib/format";
import type { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  suffix?: string;
}

export function Input({ label, suffix, className, id, ...rest }: Props) {
  const inputId = id ?? rest.name;
  return (
    <label htmlFor={inputId} className="block">
      {label && (
        <span className="mb-2 block text-sm uppercase tracking-wider text-muted">
          {label}
        </span>
      )}
      <div className="relative">
        <input
          id={inputId}
          className={cn(
            "h-14 w-full rounded-xl border border-border bg-bg-elevated px-4 text-lg text-white",
            "placeholder:text-muted/60 focus:border-accent focus:outline-none",
            suffix && "pr-14",
            className
          )}
          {...rest}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}
