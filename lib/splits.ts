import type {
  DayFocus,
  MuscleGroup,
  TrainingDays,
  UserProfile,
  WarmupItem,
} from "@/data/types";

export interface DayTemplate {
  name: string;
  groups: MuscleGroup[];
  cardioType: "HIIT" | "continuo";
}

const FULL_BODY_A: DayTemplate = {
  name: "Full Body A",
  groups: ["peito", "costas", "quadriceps", "ombro", "core"],
  cardioType: "HIIT",
};

const FULL_BODY_B: DayTemplate = {
  name: "Full Body B",
  groups: ["costas", "posterior", "gluteo", "triceps", "biceps", "core"],
  cardioType: "continuo",
};

const FULL_BODY_C: DayTemplate = {
  name: "Full Body C",
  groups: ["peito", "ombro", "quadriceps", "panturrilha", "core"],
  cardioType: "HIIT",
};

const UPPER_A: DayTemplate = {
  name: "Upper A",
  groups: ["peito", "costas", "ombro", "triceps", "biceps"],
  cardioType: "HIIT",
};

const LOWER_A: DayTemplate = {
  name: "Lower A",
  groups: ["quadriceps", "posterior", "gluteo", "panturrilha", "core"],
  cardioType: "continuo",
};

const UPPER_B: DayTemplate = {
  name: "Upper B",
  groups: ["costas", "peito", "ombro", "biceps", "triceps", "trapezio"],
  cardioType: "HIIT",
};

const LOWER_B: DayTemplate = {
  name: "Lower B",
  groups: ["posterior", "gluteo", "quadriceps", "panturrilha", "core"],
  cardioType: "continuo",
};

const PUSH: DayTemplate = {
  name: "Push",
  groups: ["peito", "ombro", "triceps"],
  cardioType: "HIIT",
};

const PULL: DayTemplate = {
  name: "Pull",
  groups: ["costas", "biceps", "trapezio", "antebraco"],
  cardioType: "HIIT",
};

const LEGS: DayTemplate = {
  name: "Legs",
  groups: ["quadriceps", "posterior", "gluteo", "panturrilha"],
  cardioType: "continuo",
};

const PUSH_B: DayTemplate = { ...PUSH, name: "Push B" };
const PULL_B: DayTemplate = { ...PULL, name: "Pull B" };
const LEGS_B: DayTemplate = { ...LEGS, name: "Legs B" };

export const FOCUS_TEMPLATES: Record<DayFocus, DayTemplate> = {
  perna: {
    name: "Perna",
    groups: ["quadriceps", "posterior", "gluteo", "panturrilha"],
    cardioType: "continuo",
  },
  "gluteo-posterior": {
    name: "Glúteo + Posterior",
    groups: ["gluteo", "posterior", "quadriceps", "panturrilha"],
    cardioType: "continuo",
  },
  braco: {
    name: "Braço",
    groups: ["biceps", "triceps", "antebraco", "ombro"],
    cardioType: "HIIT",
  },
  "peito-triceps": {
    name: "Peito + Tríceps",
    groups: ["peito", "triceps", "ombro"],
    cardioType: "HIIT",
  },
  "costas-biceps": {
    name: "Costas + Bíceps",
    groups: ["costas", "biceps", "trapezio", "antebraco"],
    cardioType: "HIIT",
  },
  ombro: {
    name: "Ombro",
    groups: ["ombro", "trapezio", "core"],
    cardioType: "HIIT",
  },
  superior: { ...UPPER_A, name: "Superior" },
  inferior: { ...LOWER_A, name: "Inferior" },
  "full-body": { ...FULL_BODY_A, name: "Full Body" },
};

export const FOCUS_LABEL: Record<DayFocus, string> = {
  perna: "Perna",
  "gluteo-posterior": "Glúteo + Posterior",
  braco: "Braço",
  "peito-triceps": "Peito + Tríceps",
  "costas-biceps": "Costas + Bíceps",
  ombro: "Ombro",
  superior: "Superior",
  inferior: "Inferior",
  "full-body": "Full Body",
};

export const FOCUS_OPTIONS = Object.keys(FOCUS_LABEL) as DayFocus[];

/** Monta o split a partir de uma lista de focos, sufixando A/B/C quando o foco se repete. */
export function buildCustomSplit(focuses: DayFocus[]): DayTemplate[] {
  const counts = focuses.reduce<Record<string, number>>(
    (acc, f) => ({ ...acc, [f]: (acc[f] ?? 0) + 1 }),
    {}
  );
  const seen: Record<string, number> = {};
  return focuses.map((focus) => {
    const base = FOCUS_TEMPLATES[focus];
    seen[focus] = (seen[focus] ?? 0) + 1;
    const suffix =
      counts[focus] > 1 ? ` ${String.fromCharCode(64 + seen[focus])}` : "";
    return { ...base, name: `${base.name}${suffix}` };
  });
}

/** Split do perfil: personalizado quando definido e consistente, senão automático. */
export function getSplitForProfile(
  profile: Pick<UserProfile, "days" | "customSplit">
): DayTemplate[] {
  const custom = profile.customSplit;
  if (
    custom &&
    custom.length === profile.days &&
    custom.every((f) => f in FOCUS_TEMPLATES)
  ) {
    return buildCustomSplit(custom);
  }
  return getSplit(profile.days);
}

export function getSplit(days: TrainingDays): DayTemplate[] {
  switch (days) {
    case 3:
      return [FULL_BODY_A, FULL_BODY_B, FULL_BODY_C];
    case 4:
      return [UPPER_A, LOWER_A, UPPER_B, LOWER_B];
    case 5:
      return [PUSH, PULL, LEGS, UPPER_A, LOWER_A];
    case 6:
      return [PUSH, PULL, LEGS, PUSH_B, PULL_B, LEGS_B];
  }
}

export const WARMUP_UPPER: WarmupItem[] = [
  {
    title: "Mobilidade de ombro",
    description:
      "Em pé, estenda um braço à frente e com a outra mão puxe gentilmente o cotovelo em direção ao peito por 30 s. Troque de lado. Em seguida, faça rotações lentas do ombro para frente e para trás (10 reps cada sentido). Não force dor — apenas abrir o arco de movimento.",
    duration: "1 min cada lado",
  },
  {
    title: "Rotação de tronco",
    description:
      "Fique em pé com os pés na largura dos ombros e os braços abertos em T. Gire lentamente o tronco para a direita e para a esquerda, deixando as mãos seguirem o movimento. Mantenha o quadril fixo. O objetivo é soltar a coluna torácica.",
    duration: "20 reps lentas",
  },
  {
    title: "Crossover leve (sem carga ou com elástico)",
    description:
      "Se houver crossover ou polea, use a menor carga possível — ou um elástico. Cruze os braços à frente do peito abrindo bem, sentindo o alongamento do peitoral. Se não houver equipamento, abrace a si mesmo e abra os braços repetidamente. Não chegue à fadiga.",
    duration: "2x15 sem falha",
  },
  {
    title: "Prancha isométrica no joelho",
    description:
      "Apoie os joelhos no chão, cotovelos alinhados com os ombros e core ativado. Mantenha a coluna neutra (nem empinada nem arqueada). Respire normalmente. Esta versão é acessível para qualquer nível e ativa o core antes do treino.",
    duration: "1x20–30 s",
  },
];

export const WARMUP_LOWER: WarmupItem[] = [
  {
    title: "Mobilidade de quadril",
    description:
      "Deitado de costas, abrace os dois joelhos contra o peito e role levemente para os lados (10 reps). Depois, com um joelho dobrado e o pé no chão, puxe o outro joelho para o lado como se fosse abrir a coxa — segure 30 s de cada lado. Alivia o iliopsoas e o glúteo antes de squat e stiff.",
    duration: "1 min",
  },
  {
    title: "Agachamento livre sem peso",
    description:
      "Pés na largura dos ombros, pontas dos pés ligeiramente abertas. Desça devagar, mantendo o tronco ereto e os joelhos na linha dos pés. No fundo, segure 1–2 s e suba. Não bata no fundo — controle sempre. Se sentir dor no joelho, abra mais as pontas dos pés.",
    duration: "2x15",
  },
  {
    title: "Caminhada com elevação de joelho",
    description:
      "Caminhe no lugar elevando os joelhos até a altura do quadril de forma alternada. Mantenha o abdômen contraído e os ombros relaxados. Esta ativação aquece glúteo, iliopsoas e melhora o equilíbrio para exercícios unilaterais.",
    duration: "2 min",
  },
  {
    title: "Ponte de glúteo",
    description:
      "Deitado de costas, joelhos dobrados e pés no chão. Eleve o quadril apertando os glúteos no topo — segure 2 s. Desça com controle. Se quiser mais ativação, coloque as mãos na barriga para sentir o core trabalhando junto. Essencial antes de qualquer exercício de posterior e glúteo.",
    duration: "2x15",
  },
];

export const WARMUP_FULL: WarmupItem[] = [
  {
    title: "Polichinelo",
    description:
      "Pule com os pés afastando e juntando alternadamente enquanto as mãos sobem acima da cabeça e voltam. Mantenha ritmo constante e respire normalmente. É a forma mais rápida de elevar a temperatura corporal e ativar cardiovascular antes do treino completo.",
    duration: "2 min",
  },
  {
    title: "Mobilidade geral (ombro e quadril)",
    description:
      "Alterne entre: rotação de ombros (10 para frente e 10 para trás) e abertura de quadril em pé (dobre um joelho lateralmente e segure 5 s de cada lado). Faça 2 ciclos completos. O objetivo é lubrificar as principais articulações que serão usadas no Full Body.",
    duration: "2 min",
  },
  {
    title: "Agachamento livre",
    description:
      "Pés na largura dos ombros, pontas dos pés ligeiramente abertas. Desça devagar, mantendo o tronco ereto e os joelhos na linha dos pés. No fundo, segure 1–2 s e suba. Não bata no fundo — controle sempre. Se sentir dor no joelho, abra mais as pontas dos pés.",
    duration: "1x15",
  },
  {
    title: "Prancha isométrica no joelho",
    description:
      "Apoie os joelhos no chão, cotovelos alinhados com os ombros e core ativado. Mantenha a coluna neutra (nem empinada nem arqueada). Respire normalmente. Esta versão é acessível para qualquer nível e ativa o core antes do treino.",
    duration: "1x20–30 s",
  },
];

export function warmupFor(template: DayTemplate): WarmupItem[] {
  const hasUpper = template.groups.some((g) =>
    ["peito", "costas", "ombro", "biceps", "triceps", "trapezio"].includes(g)
  );
  const hasLower = template.groups.some((g) =>
    ["quadriceps", "posterior", "gluteo", "panturrilha"].includes(g)
  );
  if (hasUpper && hasLower) return WARMUP_FULL;
  if (hasUpper) return WARMUP_UPPER;
  return WARMUP_LOWER;
}
