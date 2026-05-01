"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { WarmupItem } from "@/data/types";

interface Props {
  items: WarmupItem[];
}

function WarmupCard({ item }: { item: WarmupItem }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="rounded-xl border border-border bg-bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="flex-1 text-sm text-white/90 font-medium">{item.title}</span>
        <span className="text-xs text-muted shrink-0">{item.duration}</span>
        <span className="ml-2 text-muted text-xs">{open ? "−" : "?"}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="border-t border-border px-4 pb-4 pt-3 text-xs leading-relaxed text-white/70">
              {item.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export function WarmupBlock({ items }: Props) {
  return (
    <section className="rounded-2xl border border-border bg-bg-elevated p-5">
      <header className="mb-3 flex items-center gap-2">
        <span className="text-2xl">🔥</span>
        <h3 className="font-display text-2xl tracking-wide text-white">
          Aquecimento
        </h3>
      </header>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <WarmupCard key={i} item={item} />
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">
        Toque em ? para ver como executar. Sem chegar à falha.
      </p>
    </section>
  );
}
