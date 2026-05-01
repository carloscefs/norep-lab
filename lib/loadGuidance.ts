import type { Technique } from "@/data/types";

export const TECHNIQUE_LABEL: Record<Technique, string> = {
  "rest-pause": "Rest-Pause",
  isometria: "Isometria",
  parciais: "Parciais",
  "excentrica-lenta": "Excêntrica Lenta",
  "drop-set": "Drop-Set",
};

export const TECHNIQUE_HINT: Record<Technique, string> = {
  "rest-pause":
    "Vá até a falha, descanse 10–15s, faça mais reps até falhar de novo.",
  isometria: "Segure a contração no ponto mais difícil até falhar.",
  parciais: "Após a falha total, faça meio movimento até travar.",
  "excentrica-lenta": "Desça contando 4–5 segundos. Suba normal.",
  "drop-set": "Na falha, reduza a carga em ~30% e continue até falhar de novo.",
};

export function buildGuidance(): string {
  return "Falha técnica entre 6 e 15 reps. <6 = pesado demais. >15 = leve demais.";
}
