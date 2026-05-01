# NoRep Lab

App de treinos baseado na metodologia **NO-REPS**: treino até a falha, intensidade > volume, tensão contínua como principal estímulo.

## Princípios

- Sem número fixo de repetições — falha técnica é o critério.
- Faixa ideal: **6 a 15 reps** até falhar.
  - Mais de 15 → carga leve (suba o peso).
  - Menos de 6 → carga pesada (reduza).
- Técnicas de intensidade: rest-pause, isometria, parciais, excêntrica lenta, drop-set.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS**
- **Zustand** com `persist` → LocalStorage
- **Framer Motion** para micro-interações

## Como rodar

```bash
pnpm install      # ou npm install / yarn
pnpm dev
```

Abra `http://localhost:3000`. Na primeira visita, você cai em `/onboarding`. Depois de gerar o treino, é redirecionado a `/dashboard`.

## Build

```bash
pnpm build
pnpm start
```

## Deploy (Vercel)

```bash
vercel
```

Deploy 1-click — sem variáveis de ambiente, sem backend, sem banco. Tudo client-side com persistência em LocalStorage.

## Estrutura

```
app/                # rotas (onboarding, dashboard, workout/[dayId])
components/         # UI, onboarding, workout, result
hooks/              # useTimer, useCoachQuote, useHydrated
lib/                # generatePlan, splits, selectExercises, coachQuotes...
stores/             # zustand: user, plan, session
data/               # types + catálogo de exercícios (~80, curados de /docs)
```

## Origem dos exercícios

O catálogo `data/exercises.ts` foi curado a partir dos materiais em `docs/` (MusclePUMP, MusclePlus60d, Treino Braço Giga, Treino Pernas Refundini, etc.). Cada exercício tem um campo `source` apontando para o `.md` de referência.

## Geração do plano

`lib/generatePlan.ts` escolhe a divisão pela quantidade de dias:

| Dias | Divisão |
|------|---------|
| 3    | Full Body A/B/C |
| 4    | Upper / Lower (A e B) |
| 5    | Push / Pull / Legs + Upper + Lower |
| 6    | PPL ×2 |

Tempo total → calcula slots de exercícios (4–8 por dia). Aquecimento fixo por região, cardio opcional (HIIT 10min em upper, contínuo 15min em lower).

## Limitações conhecidas

- Sem testes automatizados nesta primeira versão.
- Sem autenticação / sync entre dispositivos — LocalStorage por device.
- Catálogo curado manualmente (~80 exercícios). Expansão futura pode usar parsing dos `.md` em build-time.
