import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";
import { Monogram } from "@/components/ornaments";

export const metadata: Metadata = { title: "Painel", robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-[100dvh] bg-ivory/60">
      <header className="sticky top-0 z-[100] border-b border-gold/30 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <Monogram className="h-8 text-gold" />
            <span className="eyebrow">Painel</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm sm:gap-4">
            <Link href="/" target="_blank" className="flex items-center gap-1.5 rounded-md px-3 py-2 text-ink-soft hover:text-gold-deep">
              <ExternalLink className="size-4" /> <span className="hidden sm:inline">Ver site</span>
            </Link>
            <form action={logout}>
              <button className="flex items-center gap-1.5 rounded-md px-3 py-2 text-ink-soft hover:text-gold-deep">
                <LogOut className="size-4" /> <span className="hidden sm:inline">Sair</span>
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">{children}</main>
    </div>
  );
}
