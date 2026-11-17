"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { LoaderCircle, MailCheck } from "lucide-react";
import { requestPasswordReset, setPasswordAction } from "@/app/admin/actions";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);

  if (state?.sent) {
    return (
      <div role="status" className="mt-8 rounded-lg border border-gold/40 bg-ivory/60 px-5 py-6 text-center">
        <MailCheck className="mx-auto size-7 text-gold" strokeWidth={1.3} />
        <p className="mt-3 text-lg">Se o e-mail estiver cadastrado, o link chega em instantes.</p>
        <p className="mt-1 text-sm text-ink-soft">Confira também a caixa de spam.</p>
      </div>
    );
  }

  return (
    <form action={action} className="mt-6 space-y-5">
      <div>
        <label htmlFor="email" className="label">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field" />
      </div>
      {state?.error && <p role="alert" className="text-base text-burgundy">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">
        {pending && <LoaderCircle className="size-4 animate-spin" />}
        Enviar link
      </button>
    </form>
  );
}

type LinkState = { status: "loading" } | { status: "ok"; token: string; invite: boolean } | { status: "invalid"; message: string };

export function SetPasswordForm() {
  const [link, setLink] = useState<LinkState>({ status: "loading" });
  const [state, action, pending] = useActionState(setPasswordAction, undefined);

  // O Supabase devolve o token no fragmento (#access_token=...&type=invite|recovery)
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get("access_token");
    const error = params.get("error_description");
    // tira o token da barra de endereço
    window.history.replaceState(null, "", window.location.pathname);
    if (token) setLink({ status: "ok", token, invite: params.get("type") === "invite" });
    else setLink({ status: "invalid", message: error?.replace(/\+/g, " ") || "Link inválido ou incompleto." });
  }, []);

  if (link.status === "loading") {
    return <LoaderCircle className="mx-auto mt-8 size-6 animate-spin text-gold" />;
  }

  if (link.status === "invalid") {
    return (
      <div className="mt-8 text-center">
        <p className="text-lg">Este link expirou ou já foi usado.</p>
        <p className="mt-1 text-sm text-ink-soft">{link.message}</p>
        <Link href="/admin/esqueci-senha" className="btn btn-ghost mt-6">Pedir um novo link</Link>
      </div>
    );
  }

  return (
    <form action={action} className="mt-6 space-y-5">
      <p className="text-center text-ink-soft">
        {link.invite ? "Boas-vindas! Crie a senha que você vai usar para entrar no painel." : "Escolha uma nova senha para o painel."}
      </p>
      <input type="hidden" name="token" value={link.token} />
      <div>
        <label htmlFor="password" className="label">Nova senha</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="field" />
        <p className="mt-1 text-sm text-ink-soft">Mínimo de 8 caracteres.</p>
      </div>
      <div>
        <label htmlFor="confirm" className="label">Repita a senha</label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required className="field" />
      </div>
      {state?.error && <p role="alert" className="text-base text-burgundy">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">
        {pending && <LoaderCircle className="size-4 animate-spin" />}
        Salvar e entrar
      </button>
    </form>
  );
}
