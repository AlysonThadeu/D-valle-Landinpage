"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Instagram, Menu, X } from "lucide-react";
import { Monogram } from "@/components/ornaments";
import { site } from "@/lib/site";

const links = [
  { href: "/eventos", label: "Eventos" },
  { href: "/#assessoria", label: "Assessoria" },
  { href: "/#sobre", label: "Sobre" },
  { href: "/#contato", label: "Contato" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header className={`fixed inset-x-0 top-0 z-[100] transition-all duration-500 ${scrolled ? "border-b border-gold/25 bg-paper/90 backdrop-blur-md" : "bg-transparent"}`}>
      <div className={`mx-auto flex max-w-[1280px] items-center justify-between px-6 transition-all duration-500 ${scrolled ? "h-16" : "h-20"}`}>
        <Link href="/" className="flex items-center gap-3" aria-label="D'VALLE Assessoria, início">
          <Monogram className="h-9 text-gold" />
          <span className="leading-none">
            <span className="block text-lg font-semibold tracking-[0.24em]">D&apos;VALLE</span>
            <span className="mt-1 block text-[0.6rem] font-medium tracking-[0.5em] text-ink-soft">ASSESSORIA</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex" aria-label="Principal">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="group relative text-[0.8rem] font-medium uppercase tracking-[0.24em] text-ink-soft transition-colors hover:text-ink">
              {l.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
          <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gold-deep transition hover:text-ink">
            <Instagram className="size-5" strokeWidth={1.4} />
          </a>
        </nav>

        <button className="-mr-2 p-2 md:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu">
          <Menu className="size-6" strokeWidth={1.4} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="lace fixed inset-0 z-[300] flex flex-col bg-paper md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex h-20 items-center justify-end px-6">
              <button className="-mr-2 p-2" onClick={() => setOpen(false)} aria-label="Fechar menu">
                <X className="size-6" strokeWidth={1.4} />
              </button>
            </div>
            <nav className="flex flex-1 flex-col items-center justify-center gap-7" aria-label="Menu">
              {links.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.07, duration: 0.45 }}
                  className="text-4xl font-light"
                >
                  {l.label}
                </motion.a>
              ))}
              <motion.a
                href={site.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="mt-6 flex items-center gap-2 text-gold-deep"
              >
                <Instagram className="size-5" strokeWidth={1.4} /> @{site.instagramHandle}
              </motion.a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
