"use client";

interface Props {
  items: string[];
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
      <ul className="space-y-2 text-sm text-white/85">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-muted">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">
        Sem chegar à falha. Acordar a musculatura.
      </p>
    </section>
  );
}
