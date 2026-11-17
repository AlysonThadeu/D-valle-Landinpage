import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { usingSupabase } from "@/lib/supabase";
import { LoginForm } from "@/components/admin/LoginForm";
import { AuthCard } from "@/components/admin/AuthCard";

export const metadata: Metadata = { title: "Área restrita", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <AuthCard script="Bem-vindo">
      <LoginForm />
      {usingSupabase && (
        <p className="mt-6 text-center">
          <Link href="/admin/esqueci-senha" className="text-base text-gold-deep underline-offset-4 hover:underline">
            Esqueci minha senha
          </Link>
        </p>
      )}
    </AuthCard>
  );
}
