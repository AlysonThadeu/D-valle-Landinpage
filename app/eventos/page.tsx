import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listEvents } from "@/lib/store";
import { toCards } from "@/lib/cards";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { EventsGallery } from "@/components/site/EventsGallery";
import { Reveal } from "@/components/site/Reveal";
import { WhatsAppFloat, WhatsAppIcon } from "@/components/site/WhatsApp";
import { Divider } from "@/components/ornaments";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Eventos realizados",
  description: "Casamentos, 15 anos, aniversários e eventos corporativos com assessoria e cerimonial D'VALLE em Recife e região.",
};

export default async function EventsPage() {
  const events = await listEvents();
  const cards = toCards(events);

  return (
    <>
      <Header />
      <main className="overflow-x-clip pt-28 sm:pt-32">
        <section className="mx-auto max-w-[1280px] px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-ink-soft hover:text-gold-deep">
            <ArrowLeft className="size-4" /> Início
          </Link>

          <Reveal className="mt-8 text-center">
            <p className="eyebrow">Portfólio</p>
            <p className="mt-3 font-script text-5xl leading-none text-gold-deep sm:text-6xl">histórias que vivemos</p>
            <h1 className="mt-1 text-[clamp(2.4rem,5vw,3.75rem)] font-light leading-[1.05]">Eventos realizados</h1>
            {cards.length > 0 && (
              <p className="mt-4 text-lg italic text-ink-soft">
                {cards.length} {cards.length === 1 ? "celebração" : "celebrações"} com assessoria D&apos;VALLE
              </p>
            )}
          </Reveal>
          <div className="mt-6 flex justify-center"><Divider /></div>

          <div className="pb-[clamp(4rem,8vw,7rem)]">
            <EventsGallery events={cards} pageSize={9} />
          </div>
        </section>

        <section className="bg-ivory py-16">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <p className="font-script text-5xl text-gold-deep">O próximo pode ser o seu</p>
            <p className="mt-3 text-lg text-ink-soft">Conte sobre a sua data e receba um pré-orçamento.</p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn btn-primary shimmer">
                <WhatsAppIcon className="size-4 text-gold" /> Falar no WhatsApp
              </a>
              <Link href="/#contato" className="btn btn-ghost">Pedir pré-orçamento</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
