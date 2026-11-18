import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin, supabaseAuthClient, usingSupabase } from "./supabase";

const COOKIE = "dvalle_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 dias
const SESSIONS_TABLE = "admin_sessions";

/** Identidade de quem entrou no painel. */
export type AdminIdentity = { userId: string; email: string };

/* ---------- utilidades ---------- */

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("Defina SESSION_SECRET (32+ caracteres) no .env");
  return value;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ha = createHmac("sha256", "cmp").update(a).digest();
  const hb = createHmac("sha256", "cmp").update(b).digest();
  return timingSafeEqual(ha, hb);
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

/**
 * Lista de administradores (ADMIN_EMAILS, separados por vírgula).
 * Com o Supabase, só quem estiver nesta lista entra no painel — mesmo que exista
 * outro usuário cadastrado no projeto. Lista vazia = ninguém entra (falha fechada).
 */
function adminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map(normalizeEmail)
      .filter(Boolean),
  );
}

export function isAllowedAdmin(email: string | null | undefined) {
  if (!email) return false;
  const list = adminEmails();
  if (list.size === 0) {
    console.error("ADMIN_EMAILS está vazio: nenhum administrador pode entrar no painel.");
    return false;
  }
  return list.has(normalizeEmail(email));
}

/* ---------- login ---------- */

/**
 * Produção (Supabase): e-mail/senha do Supabase Auth E e-mail presente em ADMIN_EMAILS.
 * Desenvolvimento (sem Supabase): ADMIN_EMAIL / ADMIN_PASSWORD do .env.
 */
export async function verifyLogin(email: string, password: string): Promise<AdminIdentity | null> {
  const normalized = normalizeEmail(email);
  if (!normalized || !password) return null;

  if (usingSupabase) {
    // Checa a lista antes, para nem consultar o Supabase com e-mails de fora.
    if (!isAllowedAdmin(normalized)) return null;
    const { data, error } = await supabaseAuthClient().auth.signInWithPassword({ email: normalized, password });
    if (error || !data.user || !isAllowedAdmin(data.user.email)) return null;
    return { userId: data.user.id, email: normalizeEmail(data.user.email!) };
  }

  const expectedEmail = process.env.ADMIN_EMAIL ?? "";
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "";
  if (!expectedEmail || !expectedPassword) return null;
  const emailOk = safeEqual(normalized, normalizeEmail(expectedEmail));
  const passOk = safeEqual(password, expectedPassword);
  return emailOk && passOk ? { userId: "local", email: normalized } : null;
}

/* ---------- sessão ---------- */

type Payload = { mode: "sb" | "local"; sid: string; exp: number };

async function readPayload(): Promise<Payload | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as Payload;
    if (typeof data.exp !== "number" || data.exp <= Date.now() / 1000) return null;
    if (typeof data.sid !== "string") return null;
    // Um cookie gerado no modo local não vale com o Supabase (e vice-versa).
    if (data.mode !== (usingSupabase ? "sb" : "local")) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Cria a sessão. Com o Supabase, cada sessão é uma linha em admin_sessions:
 * apagar a linha (logout, troca de senha, remoção do usuário) derruba o acesso na hora.
 */
export async function createSession(identity: AdminIdentity) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const sid = randomUUID();

  if (usingSupabase) {
    const db = supabaseAdmin();
    // limpeza das sessões vencidas deste usuário
    await db.from(SESSIONS_TABLE).delete().eq("user_id", identity.userId).lt("expires_at", new Date().toISOString());
    const { error } = await db.from(SESSIONS_TABLE).insert({
      id: sid,
      user_id: identity.userId,
      email: identity.email,
      expires_at: new Date(exp * 1000).toISOString(),
    });
    if (error) throw new Error(`Supabase (sessão): ${error.message}`);
  }

  const payload = Buffer.from(JSON.stringify({ mode: usingSupabase ? "sb" : "local", sid, exp } satisfies Payload)).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const data = await readPayload();
  if (data && usingSupabase) {
    await supabaseAdmin().from(SESSIONS_TABLE).delete().eq("id", data.sid);
  }
  (await cookies()).delete(COOKIE);
}

/** Derruba todas as sessões do painel de um usuário (ex.: após trocar a senha). */
export async function revokeUserSessions(userId: string) {
  if (!usingSupabase) return;
  const { error } = await supabaseAdmin().from(SESSIONS_TABLE).delete().eq("user_id", userId);
  if (error) throw new Error(`Supabase (sessão): ${error.message}`);
}

/** Verificado uma vez por requisição (layout + página reaproveitam o resultado). */
export const isAdmin = cache(async (): Promise<boolean> => {
  const data = await readPayload();
  if (!data) return false;
  if (!usingSupabase) return true;

  try {
    const { data: row, error } = await supabaseAdmin()
      .from(SESSIONS_TABLE)
      .select("email, expires_at")
      .eq("id", data.sid)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row || new Date(row.expires_at).getTime() <= Date.now()) return false;
    // Tirar o e-mail de ADMIN_EMAILS também corta o acesso imediatamente.
    return isAllowedAdmin(row.email);
  } catch (error) {
    console.error("Falha ao validar sessão do painel:", error);
    return false;
  }
});

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
