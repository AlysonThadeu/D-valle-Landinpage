import Link from "next/link";
import { CalendarDays, ImageIcon, MapPin, Plus, Star } from "lucide-react";
import { listEvents } from "@/lib/store";
import { EVENT_CATEGORIES, coverOf, formatEventDate } from "@/lib/types";

export default async function AdminHome({ searchParams }: PageProps<"/admin">) {
  const { salvo } = await searchParams;
  const events = await listEvents({ includeDrafts: true });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Eventos realizados</p>
          <h1 className="mt-1 text-4xl font-light">Seus álbuns</h1>
        </div>
        <Link href="/admin/eventos/novo" className="btn btn-primary">
          <Plus className="size-4" /> Novo evento
        </Link>
      </div>

      {salvo && (
        <p role="status" className="mt-6 rounded-lg border border-gold/40 bg-paper px-4 py-3 text-base text-gold-deep">
          Evento salvo. As alterações já aparecem no site.
        </p>
      )}

      {events.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-gold/50 bg-paper px-6 py-16 text-center">
          <ImageIcon className="mx-auto size-8 text-gold" strokeWidth={1.2} />
          <p className="mt-4 text-2xl font-light">Nenhum evento cadastrado ainda</p>
          <p className="mt-1 text-ink-soft">Crie o primeiro álbum com título, descrição e fotos.</p>
          <Link href="/admin/eventos/novo" className="btn btn-ghost mt-6">Cadastrar evento</Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {events.map((event) => {
            const cover = coverOf(event);
            return (
              <li key={event.id}>
                <Link
                  href={`/admin/eventos/${event.id}`}
                  className="flex gap-4 rounded-lg border border-gold/30 bg-paper p-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition hover:border-gold/70"
                >
                  <div className="aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-md bg-linen">
                    {cover && <img src={cover.thumb} alt="" className="size-full object-cover" />}
                  </div>
                  <div className="min-w-0 py-1">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-[0.15em] ${event.published ? "bg-gold/15 text-gold-deep" : "bg-ink/10 text-ink-soft"}`}>
                      {event.published ? "Publicado" : "Rascunho"}
                    </span>
                    {event.featured && (
                      <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-gold-deep">
                        <Star className="size-3 fill-gold text-gold" /> Destaque
                      </span>
                    )}
                    <p className="mt-2 truncate text-xl leading-tight">{event.title}</p>
                    <p className="text-sm text-ink-soft">{EVENT_CATEGORIES[event.category]} · {event.photos.length} fotos</p>
                    <div className="mt-1 flex flex-wrap gap-x-3 text-sm text-ink-soft">
                      {event.date && <span className="flex items-center gap-1"><CalendarDays className="size-3.5" />{formatEventDate(event.date)}</span>}
                      {event.location && <span className="flex items-center gap-1"><MapPin className="size-3.5" />{event.location}</span>}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
