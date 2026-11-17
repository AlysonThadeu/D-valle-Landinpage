import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAuthClient, usingSupabase } from "./supabase";

const COOKIE = "dvalle_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("Defina SESSION_SECRET (32+ caracteres) no .env.local");
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

/**
 * Produção (Supabase): qualquer usuário cadastrado em Authentication > Users é administrador.
 * Desenvolvimento (sem Supabase): ADMIN_EMAIL / ADMIN_PASSWORD do .env.local.
 */
export async function verifyLogin(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) return false;

  if (usingSupabase) {
    const { data, error } = await supabaseAuthClient().auth.signInWithPassword({ email: normalized, password });
    return !error && Boolean(data.user);
  }

  const expectedEmail = process.env.ADMIN_EMAIL ?? "";
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "";
  if (!expectedEmail || !expectedPassword) return false;
  const emailOk = safeEqual(normalized, expectedEmail.trim().toLowerCase());
  const passOk = safeEqual(password, expectedPassword);
  return emailOk && passOk;
}

export async function createSession() {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = Buffer.from(JSON.stringify({ exp })).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
