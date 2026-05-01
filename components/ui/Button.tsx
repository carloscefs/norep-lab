"use client";

import { cn } from "@/lib/format";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "success";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-white active:bg-accent-hover disabled:bg-accent-dim disabled:text-white/50",
  secondary:
    "bg-bg-elevated text-white border border-border active:bg-bg-card",
  ghost: "bg-transparent text-white/80 active:bg-bg-elevated",
  success: "bg-success text-black active:opacity-80",
};

export function Button({
  variant = "primary",
  fullWidth,
  className,
  children,
  ...rest
}: Props) {
  return (
    <button
      className={cn(
        "inline-flex h-14 items-center justify-center rounded-xl px-6 font-display text-xl tracking-wide transition-colors",
        "disabled:cursor-not-allowed",
        VARIANTS[variant],
        fullWidth && "w-full",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
