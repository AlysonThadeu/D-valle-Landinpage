import { coverOf, formatEventDate, type EventItem } from "./types";
import type { EventCard } from "@/components/site/EventsGallery";

/** Dados enxutos que os cards precisam (evita mandar o álbum inteiro ao navegador). */
export function toCards(events: EventItem[]): EventCard[] {
  return events.flatMap((e) => {
    const cover = coverOf(e);
    if (!cover) return [];
    return [
      {
        slug: e.slug,
        title: e.title,
        category: e.category,
        location: e.location,
        dateLabel: formatEventDate(e.date),
        cover: cover.thumb,
        previews: e.photos.filter((p) => p.id !== cover.id).slice(0, 3).map((p) => p.thumb),
        count: e.photos.length,
      },
    ];
  });
}

export const HOME_LIMIT = 6;

/** Página inicial: primeiro os destacados, depois os mais recentes, até 6. */
export function pickHomeEvents(events: EventItem[]) {
  const featured = events.filter((e) => e.featured);
  const rest = events.filter((e) => !e.featured);
  return [...featured, ...rest].slice(0, HOME_LIMIT);
}
