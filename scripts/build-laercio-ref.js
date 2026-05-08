#!/usr/bin/env node
// Concatena os docs de referência do Laércio em lib/laercioRef.ts.
// Rode após editar/adicionar docs em docs/.

const fs = require("fs");
const path = require("path");

const DIR = "docs";
const FILES = [
  "MusclePUMP Peito.md",
  "MusclePUMP Costas.md",
  "MusclePUMP Quadríceps.md",
  "MusclePUMP Posterior de Coxa.md",
  "MusclePUMP Tríceps.md",
  "MusclePUMP Panturrilha.md",
  "MusclePump Biceps.md",
  "MusclePump Ombro.md",
  "Treino Peito Monstro.md",
  "Treino Dorsal Animal.md",
  "Treino Ombro Capacete.md",
  "Treino Braço Giga.md",
  "Treino Bunda Dura.md",
  "Treino Pernas Refundini.md",
  "Treino Pernas Refundini - Bunda Dura.md",
  "Treino Panturrilha Diamante .md",
  "Treino Trapézio na Orelha.md",
  "Treino Antebraço Marreta.md",
  "Treino Abdomem Empedrado.md",
  "Meu Braço Grande - Semana 1 , 2 e 3.md",
  "Meu Braço Grande - Semana 4, 5 e 6..md",
  "peito-estufado-parte1.md",
  "peito-estufado-parte2.md",
];

let out = "";
for (const f of FILES) {
  const p = path.join(DIR, f);
  if (!fs.existsSync(p)) {
    console.error("miss", f);
    continue;
  }
  out +=
    "\n\n===== " +
    f.replace(/\.md$/, "") +
    " =====\n\n" +
    fs.readFileSync(p, "utf8").trim();
}

const ts =
  "// AUTO-GENERATED. Concatenated reference docs from Laércio Refundini methodology.\n" +
  "// Do not edit by hand — re-run scripts/build-laercio-ref.js to update.\n\n" +
  "export const LAERCIO_REFERENCE = " +
  JSON.stringify(out) +
  ";\n";

fs.mkdirSync("lib", { recursive: true });
fs.writeFileSync("lib/laercioRef.ts", ts);
console.log("wrote lib/laercioRef.ts:", out.length, "chars,", ts.length, "bytes");
