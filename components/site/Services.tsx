"use client";

import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Check } from "lucide-react";
import { Reveal, SectionTitle } from "./Reveal";
import { Frame } from "@/components/ornaments";

const modes = {
  presencial: {
    tab: "Presencial",
    place: "Recife e Região Metropolitana",
    lead: "Estou ao seu lado em cada etapa, das visitas técnicas ao último convidado indo embora.",
    items: [
      "Visitas técnicas aos espaços",
      "Degustações de buffet e bebidas",
      "Provas de vestido e trajes",
      "Reuniões com fornecedores",
      "Ensaio da cerimônia",
      "Cerimonial e coordenação no grande dia",
    ],
  },
  online: {
    tab: "Online",
    place: "Para noivos de todo o Brasil",
    lead: "Planejamento guiado a distância, com método e encontros por vídeo, para quem organiza o próprio evento.",
    items: [
      "Planejamento estratégico por etapas",
      "Planilha de orçamento e cronograma financeiro",
      "Curadoria e checagem de fornecedores",
      "Roteiro da cerimônia e da recepção",
      "Encontros de mentoria por vídeo",
      "Suporte por mensagem entre as reuniões",
    ],
  },
};

const steps = [
  { n: "I", title: "Primeira conversa", text: "Entendo a história do casal, o estilo que vocês imaginam, o número de convidados e o investimento possível." },
  { n: "II", title: "Fornecedores", text: "Pesquiso, comparo e indico profissionais de confiança. Acompanho contratos, prazos e cada detalhe acertado." },
  { n: "III", title: "Buffet, trajes e detalhes", text: "Degustações, provas de vestido, papelaria e decoração. As escolhas ganham forma com calma, uma de cada vez." },
  { n: "IV", title: "O grande dia", text: "Cronograma, bastidores e equipe alinhados. Vocês vivem o momento, e eu cuido de todo o resto." },
];

type Mode = keyof typeof modes;

export function Services() {
  const [mode, setMode] = useState<Mode>("presencial");
  const current = modes[mode];

  return (
    <section id="assessoria" className="relative bg-ivory py-[clamp(4rem,8vw,8rem)]">
      <div className="mx-auto max-w-[1280px] px-6">
        <SectionTitle eyebrow="Assessoria" script="do sim ao grande dia" title="Duas formas de caminhar juntos" />

        <Reveal className="mt-10 flex justify-center">
          <LayoutGroup>
            <div className="inline-flex rounded-full border border-gold/50 bg-paper p-1" role="tablist" aria-label="Modalidade">
              {(Object.keys(modes) as Mode[]).map((m) => (
                <button
                  key={m}
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => setMode(m)}
                  className={`relative rounded-full px-6 py-2.5 text-[0.78rem] font-semibold uppercase tracking-[0.22em] transition-colors sm:px-8 ${mode === m ? "text-paper" : "text-ink-soft hover:text-ink"}`}
                >
                  {mode === m && <motion.span layoutId="mode-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 120, damping: 20 }} />}
                  <span className="relative">{modes[m].tab}</span>
                </button>
              ))}
            </div>
          </LayoutGroup>
        </Reveal>

        <Reveal className="relative mx-auto mt-10 max-w-4xl rounded-lg border border-gold/40 bg-paper px-6 py-12 shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:px-14">
          <Frame size="w-10 sm:w-16" inset="inset-2" />
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:gap-12"
            >
              <div>
                <p className="eyebrow">{current.place}</p>
                <p className="mt-4 text-[1.65rem] font-light leading-snug">{current.lead}</p>
              </div>
              <ul className="grid content-start gap-3">
                {current.items.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.06 }}
                    className="flex items-start gap-3 border-b border-gold/20 pb-3 text-lg last:border-0"
                  >
                    <Check className="mt-1.5 size-4 shrink-0 text-gold" strokeWidth={1.6} />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </Reveal>

        {/* Linha do tempo em zigue-zague */}
        <div className="relative mx-auto mt-24 max-w-4xl">
          <motion.div
            className="absolute bottom-0 left-5 top-0 w-px origin-top bg-gold/50 md:left-1/2"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          />
          <ol className="space-y-14 md:space-y-4">
            {steps.map((s, i) => {
              const right = i % 2 === 1;
              return (
                <li key={s.n} className="relative grid md:grid-cols-2 md:gap-16">
                  <motion.span
                    className="absolute left-5 top-1 flex size-10 -translate-x-1/2 items-center justify-center rounded-full border border-gold bg-ivory text-base text-gold-deep md:left-1/2"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.2 }}
                  >
                    {s.n}
                  </motion.span>
                  <Reveal className={`pl-16 md:pl-0 ${right ? "md:col-start-2" : "md:text-right"}`} delay={0.1}>
                    <h3 className="text-[1.75rem] font-light leading-tight">{s.title}</h3>
                    <p className="mt-2 text-lg leading-relaxed text-ink-soft">{s.text}</p>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
