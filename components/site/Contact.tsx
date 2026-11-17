"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Instagram, Send } from "lucide-react";
import { Reveal } from "./Reveal";
import { Frame } from "@/components/ornaments";
import { site, whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "./WhatsApp";

const eventTypes = ["Casamento", "15 anos", "Aniversário", "Evento corporativo"];
const modalities = ["Presencial (Recife e RMR)", "Consultoria online"];

export function Contact() {
  const [form, setForm] = useState({ name: "", event: eventTypes[0], modality: modalities[0], date: "" });
  const [feedback, setFeedback] = useState("");

  function buildMessage() {
    const date = form.date ? ` Data prevista: ${new Date(form.date + "T12:00").toLocaleDateString("pt-BR")}.` : "";
    return `Olá, D'VALLE! Meu nome é ${form.name}. Estou planejando: ${form.event}. Modalidade: ${form.modality}.${date} Gostaria de conversar sobre a assessoria.`;
  }

  // Envio principal: WhatsApp já com a mensagem preenchida
  function submit(e: React.FormEvent) {
    e.preventDefault();
    window.open(whatsappLink(buildMessage()), "_blank", "noopener,noreferrer");
    setFeedback("Abrimos o WhatsApp com a sua mensagem. É só tocar em enviar.");
  }

  async function sendInstagram(e: React.MouseEvent) {
    const formEl = (e.currentTarget as HTMLButtonElement).form;
    if (formEl && !formEl.reportValidity()) return;
    const message = buildMessage();
    let copied = false;
    try {
      await navigator.clipboard.writeText(message);
      copied = true;
    } catch {}
    window.open(site.instagramDm, "_blank", "noopener,noreferrer");
    setFeedback(copied ? "Mensagem copiada. É só colar no direct e enviar." : "Direct aberto. Conte um pouco sobre o seu evento por lá.");
  }

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [key]: e.target.value });

  return (
    <section id="contato" className="lace relative bg-ivory py-[clamp(4rem,8vw,8rem)]">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal className="relative rounded-lg border border-gold/40 bg-paper px-6 py-14 shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:px-14">
          <Frame size="w-12 sm:w-20" inset="inset-2" />
          <div className="text-center">
            <p className="eyebrow">Pré-orçamento</p>
            <p className="mt-3 font-script text-5xl leading-none text-gold-deep">Vamos conversar?</p>
            <p className="mx-auto mt-4 max-w-md text-lg text-ink-soft">
              Conte o essencial. A mensagem já sai pronta para o WhatsApp ou para o direct do Instagram.
            </p>
          </div>

          <form onSubmit={submit} className="mt-10 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="c-name" className="label">Seu nome</label>
              <input id="c-name" required value={form.name} onChange={set("name")} autoComplete="name" className="field" />
            </div>
            <div>
              <label htmlFor="c-event" className="label">Tipo de evento</label>
              <select id="c-event" value={form.event} onChange={set("event")} className="field">
                {eventTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="c-date" className="label">Data prevista</label>
              <input id="c-date" type="date" value={form.date} onChange={set("date")} className="field" />
            </div>
            <fieldset className="sm:col-span-2">
              <legend className="label">Modalidade</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {modalities.map((m) => (
                  <label key={m} className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-lg transition ${form.modality === m ? "border-gold bg-gold/10" : "border-gold/40 hover:border-gold"}`}>
                    <input type="radio" name="modality" value={m} checked={form.modality === m} onChange={set("modality")} className="accent-[#8c6b27]" />
                    {m}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="mt-2 grid gap-3 sm:col-span-2 sm:grid-cols-2">
              <button type="submit" className="btn btn-primary shimmer whitespace-nowrap px-4 tracking-[0.16em]">
                <WhatsAppIcon className="size-4 text-gold" /> Enviar no WhatsApp
              </button>
              <button type="button" onClick={sendInstagram} className="btn btn-ghost whitespace-nowrap px-4 tracking-[0.16em]">
                <Send className="size-4" /> Enviar no Instagram
              </button>
            </div>
            <AnimatePresence>
              {feedback && (
                <motion.p role="status" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-center text-gold-deep sm:col-span-2">
                  {feedback}
                </motion.p>
              )}
            </AnimatePresence>
          </form>

          <div className="mt-8 flex flex-col items-center justify-center gap-x-6 gap-y-2 text-ink-soft sm:flex-row">
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-gold-deep underline-offset-4 hover:underline">
              <WhatsAppIcon className="size-4" /> {site.whatsappDisplay}
            </a>
            <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-gold-deep underline-offset-4 hover:underline">
              <Instagram className="size-4" />@{site.instagramHandle}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
