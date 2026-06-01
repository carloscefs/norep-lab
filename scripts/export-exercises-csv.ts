/**
 * Gera um CSV com todos os exercícios do catálogo para revisão dos links do YouTube.
 * Uso: npx tsx scripts/export-exercises-csv.ts
 * Saída: exercicios-youtube.csv (na raiz do projeto)
 */
import { writeFileSync } from "fs";
import { resolve } from "path";
import { EXERCISES } from "../data/exercises";

const HEADERS = [
  "id",
  "nome",
  "grupo",
  "composto",
  "academia",
  "tecnica_padrao",
  "fonte",
  "tipo_link_atual",
  "link_atual",
  "link_correto",
  "ok",
];

function csvCell(value: string | boolean | undefined): string {
  const s = value === undefined ? "" : String(value);
  // Escapa aspas duplicando-as e envolve o campo em aspas.
  return `"${s.replace(/"/g, '""')}"`;
}

function linkType(url?: string): string {
  if (!url) return "sem-link";
  return url.includes("/search?query=") ? "busca" : "direto";
}

const rows = EXERCISES.map((e) =>
  [
    e.id,
    e.name,
    e.group,
    e.isCompound ? "sim" : "nao",
    e.gymType,
    e.defaultTechnique ?? "",
    e.source ?? "",
    linkType(e.youtubeUrl),
    e.youtubeUrl ?? "",
    "", // link_correto — preencher
    "", // ok — preencher (x quando o link estiver certo)
  ]
    .map(csvCell)
    .join(",")
);

// BOM (﻿) para o Excel exibir os acentos corretamente.
const csv = "﻿" + [HEADERS.map(csvCell).join(","), ...rows].join("\r\n") + "\r\n";

const outPath = resolve(process.cwd(), "exercicios-youtube.csv");
writeFileSync(outPath, csv, "utf8");

console.log(`✅ ${EXERCISES.length} exercícios exportados para ${outPath}`);
