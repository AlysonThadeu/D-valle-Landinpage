"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion, useInView } from "framer-motion";
import { ArrowUpRight, Images, Instagram } from "lucide-react";
import { EVENT_CATEGORIES, type EventCategory } from "@/lib/types";
import { site } from "@/lib/site";

export type EventCard = {
  slug: string;
  title: string;
  category: EventCategory;
  location: string;
  dateLabel: string;
  cover: string;
  previews: string[];
  count: number;
};

const spring = { type: "spring", stiffness: 120, damping: 20 } as const;

const ORDER = Object.keys(EVENT_CATEGORIES) as EventCategory[];

type Props = {
  events: EventCard[];
  /** Mostra os filtros por categoria (só aparecem se houver mais de uma categoria) */
  showFilters?: boolean;
  /** Quantos cards por vez; com valor, aparece o botão "Carregar mais" */
  pageSize?: number;
};

export function EventsGallery({ events, showFilters = true, pageSize }: Props) {
  // Só exibe categorias que têm eventos, sempre com Casamentos primeiro.
  const present = ORDER.filter((c) => events.some((e) => e.category === c));
  const filters: ("todos" | EventCategory)[] = showFilters && present.length > 1 ? ["todos", ...present] : [];
  const [filter, setFilter] = useState<"todos" | EventCategory>("todos");
  const [shown, setShown] = useState(pageSize ?? Infinity);
  const [batchStart, setBatchStart] = useState(0);
  const filtered = events.filter((e) => filter === "todos" || e.category === filter);
  const visible = filtered.slice(0, shown);
  const remaining = filtered.length - visible.length;

  function choose(f: "todos" | EventCategory) {
    setFilter(f);
    setShown(pageSize ?? Infinity);
    setBatchStart(0);
  }

  function loadMore() {
    setBatchStart(visible.length);
    setShown((s) => s + (pageSize ?? 0));
  }

  if (events.length === 0) {
    return (
      <div className="mx-auto mt-14 max-w-xl rounded-lg border border-gold/40 bg-paper/70 px-6 py-14 text-center">
        <Images className="mx-auto size-8 text-gold" strokeWidth={1.1} />
        <p className="mt-5 text-2xl font-light">Os primeiros álbuns chegam em breve</p>
        <p className="mt-2 text-ink-soft">Enquanto isso, acompanhe os bastidores no Instagram.</p>
        <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost mt-7">
          <Instagram className="size-4" /> @{site.instagramHandle}
        </a>
      </div>
    );
  }

  return (
    <>
      {filters.length > 0 && (
        <LayoutGroup>
          <div className="mt-10 flex flex-wrap justify-center gap-x-2 gap-y-1" role="tablist" aria-label="Filtrar por categoria">
            {filters.map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={filter === f}
                onClick={() => choose(f)}
                className={`relative px-4 py-2 text-[0.78rem] font-medium uppercase tracking-[0.24em] transition-colors ${filter === f ? "text-ink" : "text-ink-soft hover:text-ink"}`}
              >
                {f === "todos" ? "Todos" : EVENT_CATEGORIES[f]}
                <sup className="ml-1 text-[0.6rem] tracking-normal text-gold-deep">
                  {f === "todos" ? events.length : events.filter((e) => e.category === f).length}
                </sup>
                {filter === f && <motion.span layoutId="filter-line" className="absolute inset-x-4 -bottom-0.5 h-px bg-gold-deep" transition={spring} />}
              </button>
            ))}
          </div>
        </LayoutGroup>
      )}

      <motion.ul layout className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-20 lg:[&>li:nth-child(3n+2)]:mt-20">
        <AnimatePresence mode="popLayout">
          {visible.map((event, i) => (
            <motion.li
              key={event.slug}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.48, delay: Math.min(Math.max(i - batchStart, 0), 5) * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-[24rem] hover:z-10 sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.34rem)]"
            >
              <AlbumCard event={event} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {remaining > 0 && (
        <motion.div layout className="mt-20 flex flex-col items-center gap-3">
          <button onClick={loadMore} className="btn btn-ghost">
            Carregar mais eventos
          </button>
          <p className="text-sm italic text-ink-soft">
            Mostrando {visible.length} de {filtered.length}
          </p>
        </motion.div>
      )}
    </>
  );
}

/** Ao passar o mouse (ou ao aparecer na tela em celulares), três fotos se abrem em leque atrás da capa. */
function AlbumCard({ event }: { event: EventCard }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const inView = useInView(ref, { amount: 0.7 });
  const [hovered, setHovered] = useState(false);
  const [canHover, setCanHover] = useState(true);

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover)").matches);
  }, []);

  const open = canHover ? hovered : inView;
  const fan = [
    { rotate: -11, x: "-30%", y: "4%" },
    { rotate: 10, x: "30%", y: "5%" },
    { rotate: -2, x: "0%", y: "-14%" },
  ];

  return (
    <Link
      ref={ref}
      href={`/eventos/${event.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group block"
    >
      <div className="relative mx-auto aspect-[4/5] w-[86%]">
        {event.previews.slice(0, 3).map((src, i) => (
          <motion.img
            key={src}
            src={src}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full rounded-t-[999px] border-4 border-paper object-cover shadow-[0_10px_30px_-12px_rgba(44,44,44,0.45)]"
            initial={false}
            animate={open ? { ...fan[i], scale: 0.72, opacity: 1 } : { rotate: 0, x: "0%", y: "0%", scale: 0.8, opacity: 0 }}
            transition={{ ...spring, delay: open ? i * 0.05 : 0 }}
          />
        ))}
        <motion.div
          className="shimmer absolute inset-0 overflow-hidden rounded-t-[999px] bg-linen shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
          animate={{ scale: open ? 1.03 : 1, y: open ? -6 : 0 }}
          transition={spring}
        >
          <img src={event.cover} alt={event.title} loading="lazy" className="size-full object-cover transition-transform duration-[2400ms] ease-out group-hover:scale-[1.06]" />
          <div className="absolute inset-0 rounded-t-[999px] ring-1 ring-inset ring-paper/40" />
        </motion.div>
        <div className="pointer-events-none absolute -inset-2.5 rounded-t-[999px] border border-gold/40 transition-colors duration-500 group-hover:border-gold" />
      </div>

      <div className="mt-8 text-center">
        <p className="eyebrow">{EVENT_CATEGORIES[event.category]}</p>
        <h3 className="mt-2 text-[1.85rem] font-light leading-tight">{event.title}</h3>
        <p className="mt-1.5 text-base italic text-ink-soft">
          {[event.location, event.dateLabel].filter(Boolean).join(" · ")}
        </p>
        <span className="mt-3 inline-flex items-center gap-1.5 text-sm tracking-[0.12em] text-gold-deep uppercase">
          {event.count} {event.count === 1 ? "foto" : "fotos"}
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
