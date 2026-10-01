# NoRep Lab

App de treinos baseado na metodologia **NO-REPS** (treino até a falha técnica, intensidade > volume) com geração de plano por IA usando a metodologia do **Laércio Refundini** (canal `@laerciorefundini`) como referência primária.

> **Produção:** https://muscle-rose.vercel.app
>
> **Estado da arquitetura:** veja [MEMORY.md](MEMORY.md) — snapshot vivo do projeto.

## Princípios NO-REPS

- Sem número fixo de repetições — falha técnica é o critério.
- Faixa ideal: **6 a 15 reps** até falhar.
  - Mais de 15 → carga leve (suba o peso).
  - Menos de 6 → carga pesada (reduza).
- Técnicas de intensidade: rest-pause, isometria, parciais, excêntrica lenta, drop-set.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + **Framer Motion**
- **Postgres** (Supabase) via `pg` (fonte de verdade) + **Zustand** persist no LocalStorage (cache no cliente)
- **JWT auth** próprio
- **Claude Sonnet 4.5** via `@anthropic-ai/sdk` para gerar treinos com contexto da metodologia

## Funcionalidades

- Login/registro próprio com JWT
- Onboarding em 2 etapas (físico + preferências) — pré-preenche se já existe perfil
- Divisão da semana **Automática** (por nº de dias) ou **Personalizada** (um foco por dia: Perna, Braço, Peito+Tríceps, Costas+Bíceps, Ombro, Glúteo+Posterior, Superior, Inferior, Full Body; focos repetidos viram A/B/C)
- Geração de treino por IA com regras de segurança (peso ≥95kg evita barra fixa, iniciante evita compostos livres pesados, etc.)
- Sync automático entre dispositivos (plano + status dos dias + perfil)
- Cronômetro de sessão, marcação de exercícios concluídos, registro de carga
- Página **Evolução** com sessões recentes + progressão de cargas
- Fallback para gerador determinístico se a IA falhar
- "Trocar" exercício prefere alternativas em que o usuário já registrou carga; o novo exercício recebe a última carga automaticamente
- Token expirado (401) desloga automaticamente; falha ao salvar treino mantém a sessão e oferece "Tentar de novo"
- Tela **/admin/videos** (só para usuários em `ADMIN_USERNAMES`, padrão `carloscefs`): edita o link do YouTube de cada exercício. Sugestões do canal @laerciorefundini vêm pré-carregadas de [data/videoSuggestions.ts](data/videoSuggestions.ts); links confirmados ficam em `exercise_videos` e sobrepõem o link de busca do catálogo no treino

## Como rodar localmente

### 1. Variáveis de ambiente

Crie `.env.local`:

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=algum_segredo_longo
ANTHROPIC_API_KEY=sk-ant-...
```

Sem `ANTHROPIC_API_KEY`, a IA cai automaticamente no gerador local determinístico.

> **Supabase:** o `db/client.ts` liga SSL automaticamente para hosts `supabase.com`. Em produção (Vercel) use a string do **Transaction pooler** (`...pooler.supabase.com:6543`) — a conexão direta (`db.<ref>.supabase.co:5432`) é IPv6-only e a serverless do Vercel não a alcança. Localmente qualquer uma das duas funciona.

### 2. Migração do banco (uma vez)

```bash
npx tsx db/migrate.ts   # lê DATABASE_URL de .env.local automaticamente
```

### 3. Bundle dos docs do Laércio (uma vez ou após editar `docs/`)

```bash
node scripts/build-laercio-ref.js
```

Gera `lib/laercioRef.ts` (~90KB) que vai pro prompt da IA com prompt caching.

### 4. Dev server

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Build & Deploy

```bash
npm run build
npm start
```

Deploy na Vercel (já linkado). O repo GitHub `carloscefs/norep-lab` está conectado, então `git push` na `master` dispara deploy automático:

```bash
git push          # auto-deploy via integração GitHub → Vercel
# ou
vercel --prod --yes
```

Variáveis de ambiente de produção: `DATABASE_URL` (Supabase Transaction pooler), `JWT_SECRET`, `ANTHROPIC_API_KEY`. Opcional: `ADMIN_USERNAMES` (lista separada por vírgula; padrão `carloscefs`) para a tela /admin/videos.

## Estrutura

```
app/
├── api/
│   ├── auth/{login,register}/    # JWT
│   ├── generate-plan/            # Claude Sonnet com docs do Laércio
│   ├── plan/                     # GET/POST/PATCH para sync de plano
│   ├── profile/, sessions/, history/
├── dashboard/, login/, onboarding/, report/, workout/[dayId]/

components/         # auth, onboarding, result, ui, workout
hooks/              # useTimer, useCoachQuote, useHydrated, useRequireAuth
lib/
├── generatePlan.ts        # gerador determinístico (fallback)
├── generatePlanRemote.ts  # wrapper que chama IA + fallback
├── laercioRef.ts          # AUTO-GENERATED — não editar à mão
├── auth.ts, splits.ts, selectExercises.ts, loadGuidance.ts, format.ts
stores/             # zustand: auth, user, plan, session
data/               # types.ts + 76 exercícios curados em exercises.ts
db/                 # pg pool + migrate
docs/               # 49 .md de referência do Laércio (metodologia)
scripts/            # build-laercio-ref.js
```

## Origem dos exercícios

O catálogo `data/exercises.ts` (76 exercícios) foi curado a partir dos materiais em `docs/` (MusclePUMP por grupo, Treinos-tema como Braço Giga / Bunda Dura, Peito Estufado, Meu Braço Grande). Cada exercício tem campo `source` apontando para o `.md` que o justifica.

Links do YouTube usam search no canal `@laerciorefundini` para qualquer exercício, garantindo que só vídeos dele aparecem.

## Geração do plano

[lib/generatePlan.ts](lib/generatePlan.ts) (determinístico) escolhe a divisão pela quantidade de dias:

| Dias | Divisão |
|------|---------|
| 3    | Full Body A/B/C |
| 4    | Upper / Lower (A e B) |
| 5    | Push / Pull / Legs + Upper + Lower |
| 6    | PPL ×2 |

Com `profile.customSplit` definido (modo Personalizada no onboarding), `getSplitForProfile` em [lib/splits.ts](lib/splits.ts) monta o split a partir de `FOCUS_TEMPLATES` e sufixa A/B/C quando o foco se repete. Persistido em `user_profiles.custom_split` (JSONB; a rota `/api/profile` cria a coluna sob demanda).

A IA ([app/api/generate-plan/route.ts](app/api/generate-plan/route.ts)) usa o mesmo split mas escolhe os IDs dos exercícios via Claude com:
- Catálogo filtrado pelo `gymType` do usuário
- 90KB de docs do Laércio injetados no system prompt (com prompt caching)
- Regras de segurança explícitas (peso, nível, gênero, objetivo)
- Bloco de **continuidade**: plano anterior + exercícios com carga registrada (lidos do banco), com instrução de manter os exercícios e trocar no máximo 1-2 por dia

## Limitações conhecidas

- Testes (`npm test`, Vitest): `lib/`, todas as rotas de API (banco e Anthropic mockados), stores Zustand e componentes `StepPreferences`/`ExerciseCard` (jsdom + Testing Library). Sem E2E de browser.
- JWT vale 180 dias; ao expirar o app desloga e pede login novamente.
- Sessões concluídas antes do commit `9c5cee6` foram perdidas (bug de contrato no POST).
- "Progressão de cargas" só registra exercícios onde o usuário preencheu carga (kg) durante o treino.

## Documentação adicional

- [MEMORY.md](MEMORY.md) — snapshot vivo da arquitetura, esquema do banco, decisões.
- `docs/` — material de referência do Laércio (não código).
