"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

/** Fade + subida de 16px ao entrar na tela (480ms, ease-out). */
export function Reveal({ delay = 0, children, ...props }: HTMLMotionProps<"div"> & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.48, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SectionTitle({ eyebrow, script, title, align = "center" }: { eyebrow: string; script?: string; title: React.ReactNode; align?: "center" | "left" }) {
  return (
    <Reveal className={align === "center" ? "text-center" : ""}>
      <p className="eyebrow">{eyebrow}</p>
      {script && <p className="mt-3 font-script text-4xl leading-none text-gold-deep sm:text-5xl">{script}</p>}
      <h2 className="mt-1 text-[clamp(2.1rem,4.5vw,3.25rem)] font-light leading-[1.08] tracking-[-0.01em]">{title}</h2>
    </Reveal>
  );
}
