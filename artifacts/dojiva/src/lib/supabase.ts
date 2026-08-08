import { createClient } from '@supabase/supabase-js';

// Injectées au build par vite.config.ts (define) depuis SUPABASE_URL / SUPABASE_ANON_KEY.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Configuration Supabase manquante : les secrets SUPABASE_URL et SUPABASE_ANON_KEY doivent être définis.',
  );
}

// Le secret peut inclure un chemin (ex. « …supabase.co/rest/v1/ ») :
// le client attend l'origine du projet, on ne garde donc que ça.
export const supabaseOrigin = new URL(supabaseUrl).origin;
export const supabasePublicKey = supabaseAnonKey;
export const supabase = createClient(supabaseOrigin, supabaseAnonKey);
