import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/admin/AuthCard";
import { ForgotPasswordForm } from "@/components/admin/PasswordForms";

export const metadata: Metadata = { title: "Recuperar senha", robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthCard script="Nova senha">
      <p className="mt-6 text-center text-ink-soft">Informe o e-mail de acesso. Enviaremos um link para você criar uma nova senha.</p>
      <ForgotPasswordForm />
      <p className="mt-6 text-center">
        <Link href="/admin/login" className="text-base text-gold-deep underline-offset-4 hover:underline">Voltar para o login</Link>
      </p>
    </AuthCard>
  );
}
