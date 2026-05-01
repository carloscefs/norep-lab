"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCoachQuote } from "@/hooks/useCoachQuote";

export function CoachQuote() {
  const quote = useCoachQuote(20000);
  return (
    <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4 text-center">
      <span className="block text-[10px] font-semibold uppercase tracking-widest text-accent">
        Modo Treinador
      </span>
      <AnimatePresence mode="wait">
        <motion.p
          key={quote}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35 }}
          className="mt-1 font-display text-lg leading-tight tracking-wide text-white"
        >
          “{quote}”
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
