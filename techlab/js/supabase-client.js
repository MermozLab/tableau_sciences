// Connexion Supabase — même projet que le parcours MLDS (« Playmaths-arcade »).
// Clé publique (publishable) : elle peut figurer dans le code ; la sécurité repose sur les règles RLS (supabase/techlab.sql).
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm";

export const SUPABASE_URL = "https://obsqakmhtvfuwnoxoksr.supabase.co";
export const SUPABASE_CLE = "sb_publishable_6FzuHhDBYOOSiAR9J-CiCA_KBfcyfhu";

export const sb = createClient(SUPABASE_URL, SUPABASE_CLE, {
  auth: { persistSession: true, storageKey: "techlab-auth" }
});
