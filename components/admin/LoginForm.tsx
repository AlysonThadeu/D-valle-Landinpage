"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { login } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="label">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field" />
      </div>
      <div>
        <label htmlFor="password" className="label">Senha</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      {state?.error && (
        <p role="alert" className="text-base text-burgundy">{state.error}</p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">
        {pending && <LoaderCircle className="size-4 animate-spin" />}
        Entrar
      </button>
    </form>
  );
}
