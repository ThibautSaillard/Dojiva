---
name: Supabase Auth quirks
description: Pièges rencontrés en branchant Supabase Auth côté client (URL secrète avec chemin, provider OAuth désactivé)
---

# Supabase Auth — pièges vérifiés

## 1. Le secret SUPABASE_URL contient un chemin
**Règle :** ne jamais passer `SUPABASE_URL` brut à `createClient` ni construire des URLs auth dessus — normaliser avec `new URL(url).origin`.
**Why:** dans ce repl, le secret vaut `https://<ref>.supabase.co/rest/v1/` (pas l'origine nue). Un POST sur `$SUPABASE_URL/auth/v1/signup` atterrit sur PostgREST → 404 `PGRST125`, très trompeur.
**How to apply:** partout où l'URL du projet Supabase est consommée (client JS, curl de test, future vérification JWT côté api-server).

## 2. Provider OAuth désactivé = page JSON brute, pas d'erreur client
**Règle :** avant `signInWithOAuth`, pré-vérifier le provider via `GET {origin}/auth/v1/settings` (public, header `apikey`) → `external.google`.
**Why:** `signInWithOAuth` REDIRIGE le navigateur vers `/auth/v1/authorize` ; si le provider est désactivé, l'utilisateur voit `{"code":400,...,"msg":"Unsupported provider..."}` en pleine page — le mapping d'erreurs côté client ne s'exécute jamais. Découvert par test E2E.
**How to apply:** tout bouton OAuth Supabase ; en cas d'échec réseau du pré-check, laisser passer le vrai flux (dégradation acceptable).

## 3. Confirmation e-mail : limites du SMTP intégré
Confirmations activées par défaut ; le SMTP intégré Supabase n'envoie que ~2 e-mails/heure (HTTP 429 `email rate limit exceeded` ensuite). Pour tester un login confirmé : `update auth.users set email_confirmed_at = now() where email = …` via psql (utiliser le pooler : `SUPABASE_POOLER_HOST`, user `postgres.<ref>` — cf. lib/db/src/url.ts).
