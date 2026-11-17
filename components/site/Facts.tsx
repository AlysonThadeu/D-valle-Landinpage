"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";

type Fact = { value: string; label: string; count?: number; suffix?: string };

const facts: Fact[] = [
  { value: "4+", count: 4, suffix: "+", label: "anos dedicados a eventos" },
  { value: "RMR", label: "atendimento presencial" },
  { value: "Brasil", label: "consultoria online" },
];

const ease = [0.22, 1, 0.36, 1] as const;

/** Números de destaque: contagem, letras surgindo uma a uma e filetes dourados se desenhando. */
export function Facts() {
  const ref = useRef<HTMLDListElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <dl ref={ref} className="mt-8 grid grid-cols-3">
      {facts.map((fact, i) => (
        <div key={fact.label} className="relative flex flex-col items-center px-2 text-center md:items-start md:px-0 md:text-left">
          {i > 0 && (
            <motion.span
              aria-hidden
              className="absolute left-0 top-1 h-[calc(100%-0.5rem)] w-px origin-top bg-gradient-to-b from-gold/70 to-gold/0 md:hidden"
              initial={{ scaleY: 0 }}
              animate={inView ? { scaleY: 1 } : undefined}
              transition={{ duration: 0.9, delay: 0.3 + i * 0.15, ease }}
            />
          )}
          <dt className="text-[clamp(1.9rem,8vw,2.6rem)] font-light leading-none text-gold-deep">
            {fact.count !== undefined ? <CountUp to={fact.count} suffix={fact.suffix ?? ""} start={inView} delay={i * 0.18} /> : <Letters text={fact.value} start={inView} delay={i * 0.18} />}
          </dt>
          <motion.dd
            className="mt-2 max-w-[9rem] text-sm leading-snug text-ink-soft"
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.6, delay: 0.45 + i * 0.18, ease }}
          >
            {fact.label}
          </motion.dd>
          <motion.span
            aria-hidden
            className="mt-3 h-px w-10 origin-center bg-gold md:origin-left"
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : undefined}
            transition={{ duration: 0.8, delay: 0.6 + i * 0.18, ease }}
          />
        </div>
      ))}
    </dl>
  );
}

function CountUp({ to, suffix, start, delay }: { to: number; suffix: string; start: boolean; delay: number }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? to : 0);
  const [done, setDone] = useState(Boolean(reduce));

  useEffect(() => {
    if (!start || reduce) return;
    const controls = animate(0, to, {
      duration: 1.4,
      delay,
      ease: "easeOut",
      onUpdate: (v) => setN(Math.round(v)),
      onComplete: () => setDone(true),
    });
    return () => controls.stop();
  }, [start, to, delay, reduce]);

  return (
    <span aria-label={`${to}${suffix}`}>
      <motion.span initial={{ opacity: 0 }} animate={start ? { opacity: 1 } : undefined} transition={{ delay }}>
        {n}
      </motion.span>
      <motion.span
        className="inline-block"
        initial={{ opacity: 0, scale: 0.4, rotate: -45 }}
        animate={done ? { opacity: 1, scale: 1, rotate: 0 } : undefined}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
      >
        {suffix}
      </motion.span>
    </span>
  );
}

function Letters({ text, start, delay }: { text: string; start: boolean; delay: number }) {
  return (
    <span aria-label={text} className="inline-flex">
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block"
          initial={{ opacity: 0, y: "0.4em", filter: "blur(6px)" }}
          animate={start ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
          transition={{ duration: 0.6, delay: delay + 0.2 + i * 0.06, ease }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}
