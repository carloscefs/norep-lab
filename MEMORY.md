# NoRep Lab — Memory Bank

> Snapshot do estado do projeto. Quando mudar arquitetura ou fluxo crítico, atualize este arquivo.
> Última atualização: 2026-05-07

## O que é

App de treinos baseado na metodologia **NO-REPS** (treino até a falha técnica, intensidade > volume), com geração de plano por IA usando a metodologia do **Laércio Refundini** como referência primária. Multi-dispositivo, multi-usuário, com persistência server-side.

## Produção

- **URL:** https://muscle-rose.vercel.app
- **Vercel project:** `muscle` (team `carloscefs-projects`)
- **DB:** Postgres em Hostinger easypanel (`wtzsfg.easypanel.host:5432/gym`)
- **AI:** Claude Sonnet 4.5 via Anthropic API

## Stack

| Camada | Tech |
|--------|------|
| Framework | Next.js 14 (App Router) + TypeScript |
| UI | Tailwind CSS + Framer Motion |
| State (cliente) | Zustand com `persist` (LocalStorage como cache) |
| Auth | JWT próprio (`jsonwebtoken` + `bcryptjs`) |
| DB | Postgres via `pg` |
| IA | `@anthropic-ai/sdk` (Claude Sonnet 4.5) |
| Deploy | Vercel |

## Arquitetura de dados

**Servidor é fonte de verdade.** LocalStorage hidrata do servidor no login e no mount do dashboard.

```
┌──────────────┐  hydrate on login  ┌──────────────┐
│  LocalStorage│ ◀──────────────────│   Postgres   │
│  (cache)     │                    │              │
└──────────────┘  push on change    └──────────────┘
       ▲                                   ▲
       │                                   │
       └───────────── UI ──────────────────┘
```

### Tabelas Postgres (db/migrate.ts)

- `users` — auth (id, username, password_hash)
- `user_profiles` — 1:1 com users (sex, age, weight_kg, height_cm, training_days, session_duration_min, level, goal, cardio, gym_type)
- `workout_plans` — JSONB do plano gerado, 1 linha ativa por usuário (DELETE+INSERT em update)
- `workout_sessions` — 1 linha por treino concluído (date, duration_seconds, completed_exercises, total_exercises)
- `exercise_logs` — N linhas por sessão (1 por exercício do dia)
- `exercise_history` — 1 linha por exercício+dia, alimenta progressão. **Só recebe linha se `completed=true AND weight_kg>0`**.

## Rotas API

| Rota | Métodos | Função |
|------|---------|--------|
| `/api/auth/login` | POST | Login com username/password |
| `/api/auth/register` | POST | Criar conta |
| `/api/profile` | GET, POST | Profile do usuário (snake_case no payload) |
| `/api/plan` | GET, POST, PATCH | Plano + status dos dias (sync entre dispositivos) |
| `/api/generate-plan` | POST | **IA**: chama Claude Sonnet com docs do Laércio injetados |
| `/api/sessions` | GET, POST | Lista + persiste sessões concluídas |
| `/api/history` | GET | Agregado para a página Evolução |

## Geração de treino com IA

[app/api/generate-plan/route.ts](app/api/generate-plan/route.ts):

1. Recebe `UserProfile` do cliente
2. Monta `splitSummary` (dias, grupos por dia, slots calculados pela duração)
3. Filtra catálogo de exercícios pelo `gymType` e envia ao Claude
4. **System prompt em duas partes:**
   - Regras curtas (peso ≥95kg evita barra fixa, iniciante evita compostos livres pesados, sem acessório de glúteo em Push/Pull, etc.) — sem cache
   - Bloco com 90KB dos docs do Laércio (`lib/laercioRef.ts`) — **com `cache_control: ephemeral`**
5. Modelo retorna `{days: [{name, exercise_ids:[]}]}`
6. Servidor monta o `WorkoutDay[]` completo (warmup, técnica, guidance, cardio) e devolve

**Custo:** primeira chamada paga 90KB de input. Próximas em até 5min hit cache (~10% do custo).

**Fallback:** se a IA falhar (rede, sem chave, JSON inválido), `lib/generatePlanRemote.ts` cai pro gerador determinístico `lib/generatePlan.ts`.

## Catálogo de exercícios

- 76 exercícios em [data/exercises.ts](data/exercises.ts), curados a partir de `docs/`
- Cada um tem `source` (qual .md justifica) e `youtubeUrl` (search no canal `@laerciorefundini`)
- `gymType: "raiz" | "moderna" | "ambos"` — filtra por academia simples vs. completa
- Removido: barra-fixa (era contraindicada para peso ≥95kg)

## Métodos do Laércio em `docs/`

49 arquivos `.md`. 23 são bundled em `lib/laercioRef.ts` via `node scripts/build-laercio-ref.js`:

- 8 MusclePUMP por grupo muscular
- 11 Treinos-tema (Peito Monstro, Dorsal Animal, Braço Giga, Bunda Dura, etc.)
- Peito Estufado partes 1+2
- Meu Braço Grande Sem 1-3 + 4-6

Os 26 restantes são programas pré-prontos (MusclePlus60d) usados só como referência de formato — não vão pro prompt da IA.

## Página Evolução

[app/report/page.tsx](app/report/page.tsx) tem duas seções:

1. **Sessões recentes** — qualquer treino concluído aparece (origem: `workout_sessions`)
2. **Progressão de cargas** — agregado por exercício, com max e último peso (origem: `exercise_history`)

**Gotcha:** se o usuário não preencher o input "Carga (kg)" durante o treino, o exercício não vai pra `exercise_history` e some da progressão. Sessão ainda aparece.

**Bug histórico já corrigido:** `pg` retorna `DECIMAL(6,2)` como string. O frontend agora coerce com `Number()` antes de comparar.

## Estrutura de pastas

```
app/
├── api/
│   ├── auth/{login,register}/route.ts
│   ├── generate-plan/route.ts      # AI route
│   ├── history/route.ts
│   ├── plan/route.ts               # plan sync
│   ├── profile/route.ts
│   └── sessions/route.ts
├── dashboard/page.tsx
├── login/page.tsx
├── onboarding/page.tsx              # 2 etapas, pré-preenche se profile existe
├── report/page.tsx                  # Evolução
└── workout/[dayId]/page.tsx

components/
├── auth/, onboarding/, result/, ui/, workout/

lib/
├── auth.ts                # JWT helpers
├── generatePlan.ts        # gerador determinístico (fallback)
├── generatePlanRemote.ts  # wrapper que chama IA com fallback
├── laercioRef.ts          # AUTO-GENERATED (rode scripts/build-laercio-ref.js)
├── selectExercises.ts, splits.ts, loadGuidance.ts, coachQuotes.ts, format.ts

stores/
├── authStore.ts           # token, username, apiFetch helper
├── userStore.ts           # profile com hydrate/push
├── planStore.ts           # days com hydrate/push
└── sessionStore.ts        # active workout session (LocalStorage only)

db/
├── client.ts              # pg pool
└── migrate.ts             # schema setup (rode uma vez)

docs/                      # 49 .md do Laércio
scripts/build-laercio-ref.js
```

## Decisões importantes

- **Sem testes automatizados** ainda — projeto pessoal, iteração rápida.
- **Nenhuma migration de schema** desde V2 — `workout_plans` já existia com JSONB e foi reaproveitada.
- **Sessions antigas (pré commit 9c5cee6)** foram perdidas — o POST tinha contrato errado (camelCase). Aceito como custo do bug.
- **Geração da IA não cacheia por usuário** — cada "Refazer" chama a API. Cache é só pelo prompt do Laércio (compartilhado entre todos os usuários).

## Como rodar localmente

```bash
npm install
# .env.local precisa de DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY
npx tsx db/migrate.ts   # uma vez, se for DB novo
npm run dev
```

## Como deployar

```bash
vercel --prod --yes     # builda do disco local
# ou
git push                # se webhook estiver ativo (não confirmado)
```

Env vars de produção via `vercel env add` ou no dashboard.
