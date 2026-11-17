/** A ordem aqui define a ordem dos filtros no site (Casamentos sempre primeiro). */
export const EVENT_CATEGORIES = {
  casamento: "Casamentos",
  "15-anos": "15 Anos",
  aniversario: "Aniversários",
  corporativo: "Corporativos",
} as const;

export type EventCategory = keyof typeof EVENT_CATEGORIES;

export type Photo = {
  id: string;
  /** Imagem grande (até 2000px), servida em /media */
  src: string;
  /** Miniatura (700px) para cards e grade */
  thumb: string;
  width: number;
  height: number;
};

export type EventItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: EventCategory;
  location: string;
  /** AAAA-MM-DD ou vazio */
  date: string;
  coverId: string | null;
  photos: Photo[];
  published: boolean;
  /** Aparece na página inicial */
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

export function isCategory(value: string): value is EventCategory {
  return value in EVENT_CATEGORIES;
}

export function coverOf(event: EventItem): Photo | undefined {
  return event.photos.find((p) => p.id === event.coverId) ?? event.photos[0];
}

export function formatEventDate(date: string) {
  if (!date) return "";
  const [y, m] = date.split("-").map(Number);
  if (!y || !m) return "";
  const month = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("pt-BR", { month: "long", timeZone: "UTC" });
  return `${month} de ${y}`;
}
