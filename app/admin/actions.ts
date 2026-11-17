"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSession, destroySession, isAdmin, verifyLogin } from "@/lib/auth";
import { supabaseAdmin, supabaseAuthClient, usingSupabase } from "@/lib/supabase";
import { deleteEvent, isOwnPhoto, saveEvent } from "@/lib/store";
import { isCategory, type Photo } from "@/lib/types";

export type FormState = { error?: string } | undefined;

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  let ok = false;
  try {
    ok = await verifyLogin(email, password);
  } catch (error) {
    console.error(error);
    return { error: "Não foi possível entrar agora. Tente novamente em instantes." };
  }
  if (!ok) {
    await new Promise((r) => setTimeout(r, 700));
    return { error: "E-mail ou senha incorretos." };
  }
  await createSession();
  redirect("/admin");
}

export type ResetState = { error?: string; sent?: boolean } | undefined;

/** Envia o e-mail de "esqueci minha senha" (somente com Supabase). */
export async function requestPasswordReset(_prev: ResetState, formData: FormData): Promise<ResetState> {
  if (!usingSupabase) return { error: "Recuperação de senha disponível apenas com o Supabase configurado." };
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Informe o e-mail." };
  const h = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || h.get("origin") || `https://${h.get("host")}`;
  try {
    await supabaseAuthClient().auth.resetPasswordForEmail(email, { redirectTo: `${origin}/admin/definir-senha` });
  } catch (error) {
    console.error(error);
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

  const auth = supabaseAdmin().auth;
  const { data, error } = await auth.getUser(token);
  if (error || !data.user) return { error: "Este link expirou ou já foi usado. Peça um novo em “Esqueci minha senha”." };
  const update = await auth.admin.updateUserById(data.user.id, { password });
  if (update.error) return { error: "Não foi possível salvar a senha. Tente outra." };

  await createSession();
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
  photos = photos.filter(isOwnPhoto);

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
