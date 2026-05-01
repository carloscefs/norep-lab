"use client";

import { cn } from "@/lib/format";

interface Option<T extends string | number> {
  value: T;
  label: string;
}

interface Props<T extends string | number> {
  label?: string;
  options: Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
  columns?: 2 | 3 | 4;
}

export function SegmentedControl<T extends string | number>({
  label,
  options,
  value,
  onChange,
  columns = 4,
}: Props<T>) {
  const colClass =
    columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-3" : "grid-cols-4";
  return (
    <div>
      {label && (
        <span className="mb-2 block text-sm uppercase tracking-wider text-muted">
          {label}
        </span>
      )}
      <div className={cn("grid gap-2", colClass)}>
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              type="button"
              key={String(opt.value)}
              onClick={() => onChange(opt.value)}
              className={cn(
                "h-14 rounded-xl border text-base font-semibold transition-colors",
                active
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-bg-elevated text-white/80 active:bg-bg-card"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
