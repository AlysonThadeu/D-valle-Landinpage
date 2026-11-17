import Link from "next/link";
import { Instagram, Lock } from "lucide-react";
import { Monogram } from "@/components/ornaments";
import { site, whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "./WhatsApp";

export function Footer() {
  return (
    <footer className="bg-ink text-paper/80">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center px-6 py-16 text-center">
        <Monogram className="h-12 text-gold" />
        <p className="mt-5 text-xl font-semibold tracking-[0.3em] text-paper">D&apos;VALLE</p>
        <p className="text-[0.65rem] tracking-[0.55em] text-paper/60">ASSESSORIA</p>
        <p className="mt-6 font-script text-3xl text-gold">com amor e organização</p>
        <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 text-base hover:text-gold">
          <Instagram className="size-4" strokeWidth={1.4} /> @{site.instagramHandle}
        </a>
        <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 text-base hover:text-gold">
          <WhatsAppIcon className="size-4" /> {site.whatsappDisplay}
        </a>
        <p className="mt-2 text-base">{site.region} · Online para todo o Brasil</p>
        <div className="mt-10 h-px w-full max-w-md bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        <div className="mt-6 flex w-full max-w-md items-center justify-between text-sm text-paper/50">
          <span>© {new Date().getFullYear()} D&apos;VALLE Assessoria</span>
          <Link href="/admin" className="inline-flex items-center gap-1.5 hover:text-gold" rel="nofollow">
            <Lock className="size-3.5" /> Área restrita
          </Link>
        </div>
      </div>
    </footer>
  );
}
