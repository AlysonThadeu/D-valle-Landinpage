import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { getEventBySlug, listEvents } from "@/lib/store";
import { EVENT_CATEGORIES, coverOf, formatEventDate } from "@/lib/types";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsApp";
import { AlbumView } from "@/components/site/AlbumView";
import { Reveal } from "@/components/site/Reveal";
import { Divider, Frame } from "@/components/ornaments";
import { site } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/eventos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return {};
  const cover = coverOf(event);
  const description = event.description.slice(0, 160) || `${EVENT_CATEGORIES[event.category]} com assessoria D'VALLE.`;
  return {
    title: event.title,
    description,
    openGraph: { title: event.title, description, images: cover ? [{ url: cover.src, width: cover.width, height: cover.height }] : undefined },
  };
}

export default async function EventPage({ params }: PageProps<"/eventos/[slug]">) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const cover = coverOf(event);
  const others = (await listEvents()).filter((e) => e.id !== event.id).slice(0, 2);
  const paragraphs = event.description.split(/\n{2,}|\r\n\r\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <>
      <Header />
      <main className="pt-24">
        <section className="relative mx-auto max-w-[1280px] px-6 pt-8">
          <Link href="/eventos" className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-ink-soft hover:text-gold-deep">
            <ArrowLeft className="size-4" /> Todos os eventos
          </Link>

          <div className="mt-10 grid items-center gap-12 md:grid-cols-2 md:gap-16">
            <Reveal>
              <p className="eyebrow">{EVENT_CATEGORIES[event.category]}</p>
              <h1 className="mt-4 text-[clamp(2.6rem,6vw,4.5rem)] font-light leading-[1.02] tracking-[-0.015em]">{event.title}</h1>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-lg italic text-ink-soft">
                {event.location && <span className="inline-flex items-center gap-2"><MapPin className="size-4 text-gold" strokeWidth={1.4} />{event.location}</span>}
                {event.date && <span className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-gold" strokeWidth={1.4} />{formatEventDate(event.date)}</span>}
              </div>
              <Divider className="mt-8" />
              {paragraphs.length > 0 && (
                <div className="mt-6 max-w-[38rem] space-y-4 text-xl leading-relaxed text-ink-soft">
                  {paragraphs.map((p, i) => (
                    <p key={i} className={`whitespace-pre-line ${i === 0 ? "first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-script first-letter:text-[4.2rem] first-letter:leading-[0.75] first-letter:text-gold-deep" : ""}`}>{p}</p>
                  ))}
                </div>
              )}
            </Reveal>
            {cover && (
              <Reveal delay={0.15} className="relative mx-auto w-full max-w-md">
                <div className="absolute -inset-3 rounded-t-[999px] border border-gold/50" />
                <img src={cover.src} alt={event.title} className="aspect-[4/5] w-full rounded-t-[999px] object-cover" />
              </Reveal>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-6 py-[clamp(4rem,8vw,7rem)]">
          <AlbumView title={event.title} photos={event.photos} />
        </section>

        <section className="bg-ivory py-16">
          <div className="relative mx-auto max-w-2xl px-6 text-center">
            <p className="font-script text-5xl text-gold-deep">Quer viver o seu?</p>
            <p className="mt-3 text-lg text-ink-soft">Conte sobre o seu evento e receba um pré-orçamento.</p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/#contato" className="btn btn-primary shimmer">Pedir pré-orçamento</Link>
              <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Ver o Instagram</a>
            </div>
          </div>
        </section>

        {others.length > 0 && (
          <section className="mx-auto max-w-[1280px] px-6 py-16">
            <p className="eyebrow text-center">Outros eventos</p>
            <ul className="mx-auto mt-8 grid max-w-3xl gap-6 sm:grid-cols-2">
              {others.map((o) => {
                const c = coverOf(o);
                return (
                  <li key={o.id}>
                    <Link href={`/eventos/${o.slug}`} className="group relative block overflow-hidden rounded-lg">
                      {c && <img src={c.thumb} alt="" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                      <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-ink/70 via-ink/10 to-transparent p-6 text-center text-paper">
                        <Frame className="text-paper/70" size="w-10" inset="inset-3" />
                        <span className="text-[0.7rem] uppercase tracking-[0.3em] text-paper/80">{EVENT_CATEGORIES[o.category]}</span>
                        <span className="mt-1 text-2xl font-light">{o.title}</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
