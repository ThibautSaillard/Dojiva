# Dojiva

Le "Duolingo du trading" : une app web gamifiée (en français) qui apprend aux débutants complets à comprendre les marchés financiers via des leçons interactives, XP, séries et quiz.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Frontend: React + Vite (`artifacts/dojiva`), framer-motion, wouter, TanStack Query

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for API contracts
- `lib/db/src/schema/academy.ts` — worlds, lessons, lesson_steps, player_progress, completed_lessons, testimonials
- `lib/db/src/schema/trading.ts` — sim_scenarios, sim_trades, strategies, badges, earned_badges
- `artifacts/api-server/src/routes/academy.ts` — académie endpoints (/worlds, /lessons, /progress, /premium/activate)
- `artifacts/api-server/src/routes/trading.ts` — simulateur, journal, stratégies, coach IA, badges (premium-gated server-side, coach en cooldown 15s)
- `artifacts/dojiva/src/pages/` — landing (home), onboarding (/apprendre), academy map (/academie), lesson player (/lecon/:id), simulator (/simulateur), laboratory (/laboratoire), coach (/coach), journal (/journal), profile (/profil)
- `artifacts/dojiva/src/components/` — CandleMascot (animated SVG mascot), CandleChart, Layout (nav globale), PremiumGate

## Architecture decisions

- Single anonymous player: one global `player_progress` row (no auth yet). Level = floor(xp/100)+1, computed server-side.
- Lesson steps are typed `info | quiz | chart-quiz`; chart-quiz stores candle data as a JSON string in `lesson_steps.chart`.
- Premium = essai gratuit : `POST /premium/activate` met `player_progress.premium=true` (pas de vrai paiement). Enforced côté serveur : toutes les routes /simulator, /journal, /strategies, /coach renvoient 403 sans premium.
- Simulateur : chaque scénario (60 bougies, 40 visibles) se joue exactement une fois (claim atomique `used=false→true`, 409 en replay) ; PnL = riskPercent (0,1–5%) du solde, mise à jour atomique du solde.
- Badges : catalogue seedé de façon idempotente au premier GET /badges ; `earned_badges.badge_id` est UNIQUE.
- Coach IA : OpenAI via l'intégration Replit AI (`gpt-5-mini`), réponse JSON 3 sections, fallback français en cas d'erreur.
- Codegen script runs a `sed` to rewrite `from 'zod'` → `from 'zod/v4'` in `lib/api-zod/src/generated/api.ts` (Orval v8 emits zod-v4 API like `zod.int()`).

## Product

- Landing page façon Duolingo : hero animé avec mascottes bougies japonaises, sections ludiques, carrousel d'avis ("Ils donnent leur avis"), disclaimer éducatif.
- Onboarding 4 étapes (objectif, niveau, marchés, style) → parcours personnalisé.
- Académie : chemin vertical de leçons par mondes, XP / série / cœurs, monde 1 gratuit (5 leçons), mondes 2-6 verrouillés premium.
- Lecteur de leçon : étapes info/quiz/chart-quiz, feedback animé, écran de célébration XP, paywall après la leçon 5 (active l'essai premium).
- Simulateur : capital virtuel 10 000 €, scénarios générés (6 marchés), Acheter/Vendre/Attendre, Entrée/SL/TP, révélation animée des bougies futures, feedback pédagogique.
- Laboratoire : créateur de stratégies (contexte, règles d'entrée, SL/TP, risque) en cartes.
- Coach IA : 3 conseils personnalisés (apprentissage, simulation, discipline).
- Journal : historique des trades + stats (winrate, RR moyen, meilleur/pire PnL). Profil : badges, XP, niveau, série.

## User preferences

- Toute l'interface en français.
- Style Duolingo assumé : mascottes animées, grosses animations de réussite, boutons chunky.
- Le nom de l'app est Dojiva (remplace "TradeQuest" du document de concept).

## Gotchas

- After changing `lib/api-spec/openapi.yaml`, always run codegen before using new hooks/schemas.
- `params` in path/query are coerced by generated Zod schemas; import exact names from `@workspace/api-zod` (grep, don't guess).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Concept complet du produit : `attached_assets/Pasted-Nom-de-l-application-Dojiva-Le-Duolingo-TradingView-Sim_1786133981264.txt`
