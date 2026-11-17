"use client";

import { motion, type Transition } from "framer-motion";

const draw = (delay = 0, duration = 1.8): Transition => ({ duration, delay, ease: [0.22, 1, 0.36, 1] });

type DrawProps = { className?: string; delay?: number; animate?: boolean };

/** Monograma D'VALLE: o "D" com o telhado da logo, em traço. */
export function Monogram({ className = "", delay = 0, animate = false }: DrawProps) {
  const paths = ["M14 8V50", "M14 8H32C50 8 60 22 60 38C60 54 50 68 32 68H22", "M10 66L37 38L54 56"];
  return (
    <svg viewBox="0 0 70 76" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth={7} strokeLinejoin="miter">
      {paths.map((d, i) =>
        animate ? (
          <motion.path key={d} d={d} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={draw(delay + i * 0.35, 1.4)} />
        ) : (
          <path key={d} d={d} />
        ),
      )}
    </svg>
  );
}

const cornerPaths = [
  "M3 117V48C3 23 23 3 48 3H117",
  "M11 117V56C11 31 31 11 56 11H117",
  "M48 3C33 17 33 35 46 40C55 43 59 33 52 28C46 25 41 31 46 34",
  "M3 48C17 33 35 33 40 46C43 55 33 59 28 52C25 46 31 41 34 46",
  "M62 11C72 20 84 20 94 11",
  "M11 62C20 72 20 84 11 94",
  "M70 11C74 4 82 4 84 9",
  "M11 70C4 74 4 82 9 84",
];

/** Arabesco de canto em filigrana. Gire com rotate-90/180/-90 para os outros cantos. */
export function Corner({ className = "", delay = 0, animate = true }: DrawProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth={1} strokeLinecap="round">
      {cornerPaths.map((d, i) =>
        animate ? (
          <motion.path
            key={d}
            d={d}
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={draw(delay + i * 0.08)}
          />
        ) : (
          <path key={d} d={d} />
        ),
      )}
      <circle cx="24" cy="24" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Quatro cantos posicionados sobre um elemento relative. */
export function Frame({ className = "text-gold", size = "w-14 sm:w-20", inset = "inset-3", delay = 0 }: { className?: string; size?: string; inset?: string; delay?: number }) {
  const pos = ["top-0 left-0", "top-0 right-0 rotate-90", "bottom-0 right-0 rotate-180", "bottom-0 left-0 -rotate-90"];
  return (
    <div className={`pointer-events-none absolute ${inset} ${className}`} aria-hidden>
      {pos.map((p, i) => (
        <Corner key={p} className={`absolute ${p} ${size}`} delay={delay + i * 0.1} />
      ))}
    </div>
  );
}

const dividerPaths = [
  "M0 16H92",
  "M148 16H240",
  "M92 16C101 5 113 5 114 12C115 17 109 19 107 15",
  "M92 16C101 27 113 27 114 20C115 15 109 13 107 17",
  "M148 16C139 5 127 5 126 12C125 17 131 19 133 15",
  "M148 16C139 27 127 27 126 20C125 15 131 13 133 17",
  "M120 8L126 16L120 24L114 16Z",
];

/** Divisor ornamental horizontal que se desenha ao entrar na tela. */
export function Divider({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  return (
    <svg viewBox="0 0 240 32" className={`h-6 w-48 text-gold ${className}`} aria-hidden fill="none" stroke="currentColor" strokeWidth={1} strokeLinecap="round">
      {dividerPaths.map((d, i) => (
        <motion.path
          key={d}
          d={d}
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={draw(delay + (i < 2 ? 0 : 0.5 + i * 0.08), i < 2 ? 1.2 : 0.9)}
        />
      ))}
    </svg>
  );
}
