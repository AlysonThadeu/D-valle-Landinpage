"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSession, destroySession, isAdmin, isAllowedAdmin, revokeUserSessions, verifyLogin } from "@/lib/auth";
import { supabaseAdmin, supabaseAuthClient, usingSupabase } from "@/lib/supabase";
import { deleteEvent, sanitizePhoto, saveEvent } from "@/lib/store";
import { isCategory, type Photo } from "@/lib/types";

export type FormState = { error?: string } | undefined;

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  let identity: Awaited<ReturnType<typeof verifyLogin>> = null;
  try {
    identity = await verifyLogin(email, password);
  } catch (error) {
    console.error(error);
    return { error: "Não foi possível entrar agora. Tente novamente em instantes." };
  }
  if (!identity) {
    await new Promise((r) => setTimeout(r, 700));
    return { error: "E-mail ou senha incorretos." };
  }
  try {
    await createSession(identity);
  } catch (error) {
    console.error(error);
    return { error: "Não foi possível entrar agora. Tente novamente em instantes." };
  }
  redirect("/admin");
}

/** Endereço público do site, obrigatório para links enviados por e-mail (nunca vem da requisição). */
function siteUrl() {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  return url && /^https?:\/\//.test(url) ? url : null;
}

/**
 * Métodos de autenticação que provam que a pessoa clicou no link enviado por e-mail
 * (recuperação, convite, link mágico). Sessões comuns de senha ou anônimas são recusadas.
 */
const EMAIL_LINK_METHODS = new Set(["recovery", "invite", "otp", "magiclink", "email/signup", "email_change"]);
const LINK_MAX_AGE_SECONDS = 60 * 60 * 24;

function emailLinkProof(token: string) {
  try {
    const claims = JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString());
    const amr: unknown[] = Array.isArray(claims.amr) ? claims.amr : [];
    const now = Date.now() / 1000;
    return amr.some((entry) => {
      const method = typeof entry === "string" ? entry : (entry as { method?: string })?.method;
      const ts = typeof entry === "object" && entry ? Number((entry as { timestamp?: number }).timestamp) : now;
      return typeof method === "string" && EMAIL_LINK_METHODS.has(method) && now - ts <= LINK_MAX_AGE_SECONDS;
    });
  } catch {
    return false;
  }
}

export type ResetState = { error?: string; sent?: boolean } | undefined;

/** Envia o e-mail de "esqueci minha senha" (somente com Supabase). */
export async function requestPasswordReset(_prev: ResetState, formData: FormData): Promise<ResetState> {
  if (!usingSupabase) return { error: "Recuperação de senha disponível apenas com o Supabase configurado." };
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Informe o e-mail." };
  const origin = siteUrl();
  if (!origin) {
    console.error("NEXT_PUBLIC_SITE_URL ausente ou inválido: o link de redefinição não pode ser montado.");
    return { error: "Não foi possível enviar o link agora. Avise o responsável pelo site." };
  }
  // Só envia e-mail para administradores autorizados (evita gastar a cota de e-mails do Supabase).
  if (isAllowedAdmin(email)) {
    try {
      await supabaseAuthClient().auth.resetPasswordForEmail(email, { redirectTo: `${origin}/admin/definir-senha` });
    } catch (error) {
      console.error(error);
    }
  }
  // Mesma resposta para e-mails cadastrados ou não, para não revelar quem é administrador.
  return { sent: true };
}

/** Define a senha a partir do link do convite ou da recuperação (token vem do e-mail do Supabase). */
export async function setPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!usingSupabase) return { error: "Disponível apenas com o Supabase configurado." };
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8) return { error: "A senha precisa ter pelo menos 8 caracteres." };
  if (password !== confirm) return { error: "As senhas não conferem." };

  const invalidLink = { error: "Este link expirou ou já foi usado. Peça um novo em “Esqueci minha senha”." };
  // O token precisa ter vindo de um link de recuperação/convite recente (não de uma sessão comum)
  if (!emailLinkProof(token)) return invalidLink;

  const auth = supabaseAdmin().auth;
  const { data, error } = await auth.getUser(token);
  if (error || !data.user || data.user.is_anonymous) return invalidLink;
  // Só administradores autorizados podem definir senha pelo painel
  if (!isAllowedAdmin(data.user.email)) return invalidLink;

  const update = await auth.admin.updateUserById(data.user.id, { password });
  if (update.error) return { error: "Não foi possível salvar a senha. Tente outra." };

  try {
    // Derruba as sessões antigas: do painel e do próprio Supabase (o link não pode ser reutilizado)
    await revokeUserSessions(data.user.id);
    await auth.admin.signOut(token, "global");
    await createSession({ userId: data.user.id, email: data.user.email! });
  } catch (error) {
    console.error(error);
    return { error: "Senha salva, mas não foi possível entrar agora. Faça login normalmente." };
  }
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

function refreshPublicPages() {
  revalidatePath("/", "layout");
}

export async function saveEventAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdmin())) redirect("/admin/login");

  const id = String(formData.get("id") ?? "") || null;
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const location = String(formData.get("location") ?? "").trim();
  const date = String(formData.get("date") ?? "");
  const published = formData.get("published") === "on";
  const featured = formData.get("featured") === "on";
  const coverId = String(formData.get("coverId") ?? "") || null;

  let photos: Photo[] = [];
  try {
    photos = JSON.parse(String(formData.get("photos") ?? "[]"));
  } catch {
    return { error: "Lista de fotos inválida. Recarregue a página." };
  }
  if (!Array.isArray(photos)) photos = [];
  photos = photos.map(sanitizePhoto).filter((p): p is Photo => p !== null);
  // sem ids repetidos
  photos = photos.filter((p, i) => photos.findIndex((q) => q.id === p.id) === i);

  if (!title) return { error: "Informe o título do evento." };
  if (!isCategory(category)) return { error: "Escolha uma categoria." };
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Data inválida." };
  if (published && photos.length === 0) return { error: "Adicione ao menos uma foto antes de publicar." };

  try {
    await saveEvent(id, {
      title,
      description,
      category,
      location,
      date,
      published,
      featured,
      photos,
      coverId: photos.some((p) => p.id === coverId) ? coverId : (photos[0]?.id ?? null),
    });
  } catch (error) {
    console.error(error);
    return { error: "Não foi possível salvar. Tente novamente em instantes." };
  }
  refreshPublicPages();
  redirect("/admin?salvo=1");
}

export async function deleteEventAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  await deleteEvent(String(formData.get("id")));
  refreshPublicPages();
  redirect("/admin");
}
