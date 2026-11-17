"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Share2, X } from "lucide-react";
import type { Photo } from "@/lib/types";

const slide = {
  enter: (d: number) => ({ opacity: 0, x: d * 60 }),
  center: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: d * -60 }),
};

export function AlbumView({ title, photos }: { title: string; photos: Photo[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const [dir, setDir] = useState(0);
  const [shared, setShared] = useState(false);

  const go = useCallback(
    (step: number) => {
      setDir(step);
      setIndex((i) => (i === null ? i : (i + step + photos.length) % photos.length));
    },
    [photos.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [index, go]);

  // pré-carrega vizinhas para a navegação ser instantânea
  useEffect(() => {
    if (index === null) return;
    [1, -1].forEach((s) => {
      const img = new Image();
      img.src = photos[(index + s + photos.length) % photos.length].src;
    });
  }, [index, photos]);

  async function share() {
    const url = window.location.href.split("#")[0];
    try {
      if (navigator.share) {
        await navigator.share({ title, text: `${title} · D'VALLE Assessoria`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2200);
    } catch {}
  }

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Álbum</p>
          <p className="mt-1 text-3xl font-light">{photos.length} {photos.length === 1 ? "fotografia" : "fotografias"}</p>
        </div>
        <button onClick={share} className="btn btn-ghost">
          {shared ? <Check className="size-4" /> : <Share2 className="size-4" />}
          {shared ? "Link copiado" : "Compartilhar"}
        </button>
      </div>

      <ul className="mt-10 columns-2 gap-3 sm:gap-4 md:columns-3">
        {photos.map((p, i) => (
          <motion.li
            key={p.id}
            className="mb-3 break-inside-avoid sm:mb-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.48, delay: (i % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              onClick={() => { setDir(0); setIndex(i); }}
              className="group relative block w-full overflow-hidden rounded-md bg-linen"
              aria-label={`Abrir foto ${i + 1} de ${photos.length}`}
            >
              <img
                src={p.thumb}
                alt=""
                loading="lazy"
                width={p.width}
                height={p.height}
                className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <span className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/10" />
            </button>
          </motion.li>
        ))}
      </ul>

      <AnimatePresence>
        {index !== null && (
          <motion.div
            className="fixed inset-0 z-[300] flex flex-col bg-[#1d1b18]/97 text-paper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${title}, foto ${index + 1}`}
          >
            <div className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-6">
              <span className="text-sm tracking-[0.3em] text-paper/70">
                {String(index + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={share} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-paper/80 hover:text-gold" aria-label="Compartilhar álbum">
                  {shared ? <Check className="size-5" /> : <Share2 className="size-5" strokeWidth={1.4} />}
                  <span className="hidden sm:inline">{shared ? "Link copiado" : "Compartilhar"}</span>
                </button>
                <button onClick={() => setIndex(null)} className="rounded-md p-2 text-paper/80 hover:text-gold" aria-label="Fechar">
                  <X className="size-6" strokeWidth={1.4} />
                </button>
              </div>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-2 pb-6 sm:px-20">
              <AnimatePresence initial={false} custom={dir} mode="popLayout">
                <motion.img
                  key={photos[index].id}
                  src={photos[index].src}
                  alt=""
                  custom={dir}
                  className="max-h-full max-w-full select-none rounded-sm object-contain shadow-2xl"
                  variants={slide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.6}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -70 || info.velocity.x < -400) go(1);
                    else if (info.offset.x > 70 || info.velocity.x > 400) go(-1);
                  }}
                  draggable={false}
                />
              </AnimatePresence>

              {photos.length > 1 && (
                <>
                  <button onClick={() => go(-1)} className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-paper/20 p-3 text-paper/80 transition hover:border-gold hover:text-gold sm:block" aria-label="Foto anterior">
                    <ChevronLeft className="size-5" strokeWidth={1.4} />
                  </button>
                  <button onClick={() => go(1)} className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-paper/20 p-3 text-paper/80 transition hover:border-gold hover:text-gold sm:block" aria-label="Próxima foto">
                    <ChevronRight className="size-5" strokeWidth={1.4} />
                  </button>
                </>
              )}
            </div>
            <p className="pb-5 text-center font-script text-2xl text-gold sm:hidden">deslize para ver mais</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
