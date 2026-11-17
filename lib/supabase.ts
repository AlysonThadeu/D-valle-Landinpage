import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Com as duas variáveis definidas, banco, fotos e login usam o Supabase. */
export const usingSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY);

const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };

let admin: SupabaseClient | null = null;

/** Cliente com a chave service_role (somente servidor). Compartilhado entre requisições. */
export function supabaseAdmin() {
  if (!admin) admin = createClient(SUPABASE_URL!, SUPABASE_KEY!, options);
  return admin;
}

/** Cliente descartável para chamadas de login, que guardam sessão no próprio objeto. */
export function supabaseAuthClient() {
  return createClient(SUPABASE_URL!, SUPABASE_KEY!, options);
}
