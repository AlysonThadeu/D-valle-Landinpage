"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Corner, Monogram } from "@/components/ornaments";
import { site } from "@/lib/site";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero({ slides }: { slides: string[] }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const archY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -40]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5200);
    return () => clearInterval(id);
  }, [slides.length]);

  const titleWords = "merece ser vivido por inteiro.".split(" ");

  return (
    <section ref={ref} className="relative overflow-hidden pt-28 pb-16 sm:pt-32 md:min-h-[100dvh] md:pb-24">
      <div className="lace pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_70%)]" />

      <div className="relative mx-auto grid max-w-[1280px] items-center gap-10 px-6 md:grid-cols-[1.05fr_0.95fr] md:gap-16">
        <motion.div style={{ y: textY }} className="order-2 md:order-1">
          <motion.p className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
            Assessoria & Cerimonial · Recife
          </motion.p>

          <h1 className="mt-6">
            <motion.span
              className="block font-script text-[clamp(3.6rem,9vw,6.5rem)] leading-[0.9] text-gold-deep"
              initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
              animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
              transition={{ duration: 1.6, delay: 0.2, ease }}
            >
              Seu sim
            </motion.span>
            <span className="mt-2 block text-[clamp(2.4rem,5.4vw,4.4rem)] font-light leading-[1.05] tracking-[-0.015em]">
              {titleWords.map((w, i) => (
                <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
                  <motion.span
                    className="inline-block"
                    initial={{ y: "105%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, delay: 0.7 + i * 0.09, ease }}
                  >
                    {w}&nbsp;
                  </motion.span>
                </span>
              ))}
            </span>
          </h1>

          <motion.p
            className="mt-7 max-w-[34rem] text-xl leading-relaxed text-ink-soft"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3, ease }}
          >
            Casamentos e celebrações conduzidos com calma e atenção, do primeiro encontro ao último brinde.
            Presencial em {site.region}, ou online para todo o Brasil.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.5, ease }}
          >
            <a href="#eventos" className="btn btn-primary shimmer">Ver eventos realizados</a>
            <a href="#contato" className="btn btn-ghost">Agendar conversa</a>
          </motion.div>
        </motion.div>

        {/* Arco com as capas mais recentes */}
        <motion.div style={{ y: archY }} className="relative order-1 mx-auto w-full max-w-[15rem] sm:max-w-[22rem] md:order-2 md:max-w-none">
          <motion.div
            className="relative aspect-[4/5] md:aspect-[3/4]"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease }}
          >
            <div className="absolute -inset-3 rounded-t-[999px] border border-gold/50 sm:-inset-4" />
            <div className="relative size-full overflow-hidden rounded-t-[999px] bg-ivory">
              {slides.length > 0 ? (
                <AnimatePresence initial={false}>
                  <motion.img
                    key={slides[index]}
                    src={slides[index]}
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ opacity: { duration: 1.4 }, scale: { duration: 6.5, ease: "linear" } }}
                  />
                </AnimatePresence>
              ) : (
                <div className="lace flex size-full flex-col items-center justify-center">
                  <Monogram className="h-28 text-gold" animate delay={0.6} />
                  <p className="mt-6 font-script text-4xl text-gold-deep">D&apos;Valle</p>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent" />
            </div>
            <Corner className="absolute -bottom-7 -left-7 w-20 rotate-[-90deg] text-gold sm:w-24" delay={1} />
            <Corner className="absolute -bottom-7 -right-7 w-20 rotate-180 text-gold sm:w-24" delay={1.2} />
          </motion.div>
          {slides.length > 1 && (
            <div className="mt-10 flex justify-center gap-2" aria-hidden>
              {slides.map((s, i) => (
                <span key={s} className={`h-px transition-all duration-700 ${i === index ? "w-8 bg-gold-deep" : "w-3 bg-gold/50"}`} />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <motion.a
        href="#eventos"
        aria-label="Rolar para os eventos"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-gold-deep md:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
      >
        <span className="text-[0.65rem] tracking-[0.4em] uppercase">Role</span>
        <motion.span animate={reduce ? undefined : { y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <ArrowDown className="size-4" strokeWidth={1.2} />
        </motion.span>
      </motion.a>
    </section>
  );
}
