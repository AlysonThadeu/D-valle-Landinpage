import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listEvents } from "@/lib/store";
import { coverOf } from "@/lib/types";
import { pickHomeEvents, toCards } from "@/lib/cards";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { EventsGallery } from "@/components/site/EventsGallery";
import { Reveal, SectionTitle } from "@/components/site/Reveal";
import { Services } from "@/components/site/Services";
import { About } from "@/components/site/About";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsApp";
import { Divider } from "@/components/ornaments";

export default async function Home() {
  const events = await listEvents();
  const highlights = pickHomeEvents(events);

  const slides = highlights.slice(0, 5).flatMap((e) => {
    const cover = coverOf(e);
    return cover ? [cover.src] : [];
  });

  return (
    <>
      <Header />
      <main>
        <Hero slides={slides} />

        <section id="eventos" className="overflow-x-clip py-[clamp(4rem,8vw,8rem)]">
          <div className="mx-auto max-w-[1280px] px-6">
            <SectionTitle eyebrow="Portfólio" script="histórias que vivemos" title="Eventos realizados" />
            <div className="mt-6 flex justify-center"><Divider /></div>
            <EventsGallery events={toCards(highlights)} showFilters={false} />
            {events.length > highlights.length && (
              <Reveal className="mt-20 flex flex-col items-center gap-3">
                <Link href="/eventos" className="btn btn-primary shimmer group">
                  Ver todos os eventos
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <p className="text-sm italic text-ink-soft">{events.length} celebrações no portfólio</p>
              </Reveal>
            )}
          </div>
        </section>

        <Services />
        <About />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
