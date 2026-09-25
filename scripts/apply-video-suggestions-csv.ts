/**
 * Preenche `link_correto`, `titulo_video` e `confianca` em exercicios-youtube.csv
 * a partir de data/videoSuggestions.ts.
 * Uso: npx tsx scripts/apply-video-suggestions-csv.ts
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { VIDEO_SUGGESTIONS, youtubeWatchUrl } from "../data/videoSuggestions";

const file = resolve(process.cwd(), "exercicios-youtube.csv");
const raw = readFileSync(file, "utf8").replace(/^﻿/, "");

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else cell += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.length > 1);
}

const q = (s: string) => `"${s.replace(/"/g, '""')}"`;

const [header, ...body] = parseCsv(raw);
const fields = [...header];
for (const extra of ["titulo_video", "confianca"]) if (!fields.includes(extra)) fields.push(extra);
const idx = (name: string) => fields.indexOf(name);

let withVideo = 0;
const out = body.map((r) => {
  const row = [...r];
  while (row.length < fields.length) row.push("");
  const s = VIDEO_SUGGESTIONS[row[idx("id")]];
  if (s) {
    withVideo++;
    row[idx("link_correto")] = youtubeWatchUrl(s.videoId);
    row[idx("titulo_video")] = s.title;
    row[idx("confianca")] = s.confidence;
  } else {
    row[idx("titulo_video")] = "";
    row[idx("confianca")] = "sem-video";
  }
  return row;
});

writeFileSync(file, "﻿" + [fields, ...out].map((r) => r.map(q).join(",")).join("\n") + "\n", "utf8");
console.log(`CSV atualizado: ${out.length} exercícios, ${withVideo} com vídeo sugerido, ${out.length - withVideo} sem vídeo.`);
