import type { Metadata } from "next";
import { AuthCard } from "@/components/admin/AuthCard";
import { SetPasswordForm } from "@/components/admin/PasswordForms";

export const metadata: Metadata = { title: "Definir senha", robots: { index: false, follow: false } };

/** Destino dos links de convite e de recuperação enviados pelo Supabase. */
export default function SetPasswordPage() {
  return (
    <AuthCard script="Sua senha">
      <SetPasswordForm />
    </AuthCard>
  );
}
