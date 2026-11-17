import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { supabaseAdmin as db, usingSupabase } from "./supabase";
import type { EventCategory, EventItem, Photo } from "./types";

export { usingSupabase };

/**
 * Camada de dados. Dois modos:
 * - Supabase (produção/Vercel): quando SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidos.
 *   Eventos na tabela `events`, fotos no bucket público `SUPABASE_BUCKET` (padrão "eventos").
 * - Local (desenvolvimento): storage/events.json + storage/uploads.
 */

const BUCKET = process.env.SUPABASE_BUCKET || "eventos";

export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "storage");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const EVENTS_FILE = path.join(DATA_DIR, "events.json");


/* ---------- Mapeamento da tabela ---------- */

type Row = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: EventCategory;
  location: string;
  date: string;
  cover_id: string | null;
  photos: Photo[];
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

const fromRow = (r: Row): EventItem => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  description: r.description,
  category: r.category,
  location: r.location,
  date: r.date,
  coverId: r.cover_id,
  photos: r.photos ?? [],
  published: r.published,
  featured: r.featured ?? false,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const toRow = (e: EventItem): Row => ({
  id: e.id,
  slug: e.slug,
  title: e.title,
  description: e.description,
  category: e.category,
  location: e.location,
  date: e.date,
  cover_id: e.coverId,
  photos: e.photos,
  published: e.published,
  featured: e.featured,
  created_at: e.createdAt,
  updated_at: e.updatedAt,
});

/* ---------- Leitura e escrita da lista completa ---------- */

async function readAll(): Promise<EventItem[]> {
  if (usingSupabase) {
    const { data, error } = await db().from("events").select("*");
    if (error) throw new Error(`Supabase: ${error.message}`);
    return (data as Row[]).map(fromRow);
  }
  try {
    const list = JSON.parse(await fs.readFile(EVENTS_FILE, "utf8")) as EventItem[];
    return list.map((e) => ({ ...e, featured: e.featured ?? false }));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeLocal(events: EventItem[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${EVENTS_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(events, null, 2), "utf8");
  await fs.rename(tmp, EVENTS_FILE);
}

/* ---------- API pública ---------- */

function byDateDesc(a: EventItem, b: EventItem) {
  return (b.date || b.createdAt).localeCompare(a.date || a.createdAt);
}

export async function listEvents({ includeDrafts = false } = {}) {
  const events = await readAll();
  return events.filter((e) => includeDrafts || e.published).sort(byDateDesc);
}

export async function getEventById(id: string) {
  return (await readAll()).find((e) => e.id === id) ?? null;
}

export async function getEventBySlug(slug: string) {
  return (await readAll()).find((e) => e.slug === slug && e.published) ?? null;
}

export function slugify(text: string) {
  return (
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/&/g, " e ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "evento"
  );
}

export type EventInput = Omit<EventItem, "id" | "slug" | "createdAt" | "updatedAt">;

let localQueue: Promise<unknown> = Promise.resolve();

export async function saveEvent(id: string | null, input: EventInput) {
  const run = async () => {
    const events = await readAll();
    const now = new Date().toISOString();
    const existing = id ? events.find((e) => e.id === id) : undefined;
    if (id && !existing) throw new Error("Evento não encontrado.");

    const base = slugify(input.title);
    let slug = base;
    for (let n = 2; events.some((e) => e.slug === slug && e.id !== id); n++) slug = `${base}-${n}`;

    const event: EventItem = {
      ...input,
      id: existing?.id ?? crypto.randomUUID(),
      slug,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    if (usingSupabase) {
      const { error } = await db().from("events").upsert(toRow(event));
      if (error) throw new Error(`Supabase: ${error.message}`);
    } else {
      await writeLocal(existing ? events.map((e) => (e.id === id ? event : e)) : [...events, event]);
    }

    const keep = new Set(event.photos.map((p) => p.id));
    await deletePhotos((existing?.photos ?? []).filter((p) => !keep.has(p.id)));
    return event;
  };

  // No modo local, serializa gravações para não perder alterações simultâneas.
  if (usingSupabase) return run();
  const result = localQueue.then(run);
  localQueue = result.catch(() => undefined);
  return result;
}

export async function deleteEvent(id: string) {
  const event = await getEventById(id);
  if (!event) return;
  if (usingSupabase) {
    const { error } = await db().from("events").delete().eq("id", id);
    if (error) throw new Error(`Supabase: ${error.message}`);
  } else {
    await writeLocal((await readAll()).filter((e) => e.id !== id));
  }
  await deletePhotos(event.photos);
}

/* ---------- Fotos ---------- */

const EXT = { "image/webp": "webp", "image/jpeg": "jpg" } as const;
export type PhotoMime = keyof typeof EXT;
export const isPhotoMime = (t: string): t is PhotoMime => t in EXT;

function fileNames(id: string, mime: PhotoMime) {
  const ext = EXT[mime];
  return { full: `${id}.${ext}`, thumb: `${id}-t.${ext}` };
}

/** Grava a foto (já redimensionada no navegador) e devolve os endereços públicos. */
export async function storePhoto(
  full: Buffer,
  thumb: Buffer,
  mime: PhotoMime,
  size: { width: number; height: number },
): Promise<Photo> {
  const id = crypto.randomUUID();
  const names = fileNames(id, mime);

  if (usingSupabase) {
    const bucket = db().storage.from(BUCKET);
    for (const [name, data] of [[names.full, full], [names.thumb, thumb]] as const) {
      const { error } = await bucket.upload(name, data, { contentType: mime, cacheControl: "31536000", upsert: false });
      if (error) throw new Error(`Supabase Storage: ${error.message}`);
    }
    return {
      id,
      src: bucket.getPublicUrl(names.full).data.publicUrl,
      thumb: bucket.getPublicUrl(names.thumb).data.publicUrl,
      ...size,
    };
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, names.full), full);
  await fs.writeFile(path.join(UPLOAD_DIR, names.thumb), thumb);
  return { id, src: `/media/${names.full}`, thumb: `/media/${names.thumb}`, ...size };
}

function fileNameFromUrl(url: string) {
  return url.split("?")[0].split("/").pop() ?? "";
}

/** Confere se a foto enviada pelo formulário foi gravada por este site. */
export function isOwnPhoto(p: Photo) {
  if (typeof p?.id !== "string" || !/^[a-f0-9-]{36}$/.test(p.id)) return false;
  if (typeof p.width !== "number" || typeof p.height !== "number") return false;
  const prefix = usingSupabase ? db().storage.from(BUCKET).getPublicUrl("").data.publicUrl : "/media/";
  return [p.src, p.thumb].every((u) => typeof u === "string" && u.startsWith(prefix) && fileNameFromUrl(u).startsWith(p.id));
}

async function deletePhotos(photos: Photo[]) {
  const names = photos.flatMap((p) => [fileNameFromUrl(p.src), fileNameFromUrl(p.thumb)]).filter(Boolean);
  if (names.length === 0) return;
  if (usingSupabase) {
    await db().storage.from(BUCKET).remove(names);
    return;
  }
  await Promise.all(names.map((n) => fs.rm(path.join(UPLOAD_DIR, n), { force: true })));
}
