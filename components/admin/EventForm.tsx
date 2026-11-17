"use client";

import { useActionState, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ImagePlus, LoaderCircle, Star, Trash2, X } from "lucide-react";
import { deleteEventAction, saveEventAction } from "@/app/admin/actions";
import { EVENT_CATEGORIES, type EventItem, type Photo } from "@/lib/types";
import { resizeImage } from "@/lib/resize-image";

type Pending = { key: string; name: string; error?: string };

export function EventForm({ event }: { event?: EventItem }) {
  const [state, action, saving] = useActionState(saveEventAction, undefined);
  const [photos, setPhotos] = useState<Photo[]>(event?.photos ?? []);
  const [coverId, setCoverId] = useState<string | null>(event?.coverId ?? null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploading = pending.some((p) => !p.error);
  const effectiveCover = photos.some((p) => p.id === coverId) ? coverId : photos[0]?.id;

  async function upload(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const items = list.map((file) => ({ file, key: crypto.randomUUID() }));
    setPending((p) => [...p, ...items.map(({ key, file }) => ({ key, name: file.name }))]);

    // até 3 envios simultâneos
    let cursor = 0;
    async function worker() {
      while (cursor < items.length) {
        const { file, key } = items[cursor++];
        try {
          const img = await resizeImage(file);
          const body = new FormData();
          body.append("full", img.full);
          body.append("thumb", img.thumb);
          body.append("width", String(img.width));
          body.append("height", String(img.height));
          const res = await fetch("/api/admin/upload", { method: "POST", body });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Falha no envio");
          setPhotos((p) => [...p, data as Photo]);
          setPending((p) => p.filter((x) => x.key !== key));
        } catch (err) {
          setPending((p) => p.map((x) => (x.key === key ? { ...x, error: (err as Error).message } : x)));
        }
      }
    }
    await Promise.all([worker(), worker(), worker()]);
  }

  function move(index: number, dir: -1 | 1) {
    setPhotos((p) => {
      const next = [...p];
      const target = index + dir;
      if (target < 0 || target >= next.length) return p;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <>
      <form action={action} className="mt-8 space-y-8">
        <input type="hidden" name="id" value={event?.id ?? ""} />
        <input type="hidden" name="photos" value={JSON.stringify(photos)} />
        <input type="hidden" name="coverId" value={effectiveCover ?? ""} />

        <section className="grid gap-5 rounded-lg border border-gold/30 bg-paper p-5 sm:grid-cols-2 sm:p-8">
          <div className="sm:col-span-2">
            <label htmlFor="title" className="label">Título</label>
            <input id="title" name="title" required defaultValue={event?.title} placeholder="Casamento Marina & Lucas" className="field text-xl" />
          </div>
          <div>
            <label htmlFor="category" className="label">Categoria</label>
            <select id="category" name="category" defaultValue={event?.category ?? "casamento"} className="field">
              {Object.entries(EVENT_CATEGORIES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date" className="label">Data do evento</label>
            <input id="date" name="date" type="date" defaultValue={event?.date} className="field" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="location" className="label">Local</label>
            <input id="location" name="location" defaultValue={event?.location} placeholder="Igreja / espaço, cidade" className="field" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className="label">Descrição</label>
            <textarea id="description" name="description" rows={6} defaultValue={event?.description} placeholder="Conte um pouco da história, da atmosfera e dos detalhes deste dia." className="field leading-relaxed" />
          </div>
        </section>

        <section className="rounded-lg border border-gold/30 bg-paper p-5 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-light">Fotos</h2>
            <p className="text-sm text-ink-soft">A estrela define a capa. Use as setas para ordenar.</p>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); void upload(e.dataTransfer.files); }}
            className={`mt-5 flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-10 transition ${dragging ? "border-gold bg-gold/10" : "border-gold/40 hover:border-gold"}`}
          >
            <ImagePlus className="size-8 text-gold" strokeWidth={1.2} />
            <span className="text-lg">Toque para escolher ou arraste as fotos aqui</span>
            <span className="text-sm text-ink-soft">JPG, PNG ou WEBP · várias de uma vez</span>
          </button>
          <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => { if (e.target.files) void upload(e.target.files); e.target.value = ""; }} />

          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            <AnimatePresence initial={false}>
              {photos.map((photo, i) => {
                const isCover = photo.id === effectiveCover;
                return (
                  <motion.li
                    key={photo.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 260, damping: 26 }}
                    className={`group relative aspect-square overflow-hidden rounded-md bg-linen ring-2 ${isCover ? "ring-gold" : "ring-transparent"}`}
                  >
                    <img src={photo.thumb} alt="" className="size-full object-cover" />
                    {isCover && <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-widest text-paper">Capa</span>}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-ink/80 to-transparent p-1.5 pt-6 text-paper">
                      <div className="flex">
                        <IconBtn label="Mover para trás" onClick={() => move(i, -1)} disabled={i === 0}><ChevronLeft className="size-4" /></IconBtn>
                        <IconBtn label="Mover para frente" onClick={() => move(i, 1)} disabled={i === photos.length - 1}><ChevronRight className="size-4" /></IconBtn>
                      </div>
                      <div className="flex">
                        <IconBtn label="Usar como capa" onClick={() => setCoverId(photo.id)}><Star className={`size-4 ${isCover ? "fill-gold text-gold" : ""}`} /></IconBtn>
                        <IconBtn label="Remover foto" onClick={() => setPhotos((p) => p.filter((x) => x.id !== photo.id))}><Trash2 className="size-4" /></IconBtn>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
              {pending.map((p) => (
                <motion.li key={p.key} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden rounded-md bg-linen p-3 text-center text-sm">
                  {p.error ? (
                    <>
                      <span className="text-burgundy">{p.error}</span>
                      <span className="w-full truncate text-xs text-ink-soft">{p.name}</span>
                      <button type="button" onClick={() => setPending((x) => x.filter((y) => y.key !== p.key))} className="absolute right-1 top-1 p-1" aria-label="Dispensar"><X className="size-4" /></button>
                    </>
                  ) : (
                    <>
                      <LoaderCircle className="size-6 animate-spin text-gold" />
                      <span className="w-full truncate text-xs text-ink-soft">{p.name}</span>
                    </>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </section>

        <section className="flex flex-col gap-4 rounded-lg border border-gold/30 bg-paper p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="space-y-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" name="published" defaultChecked={event?.published ?? true} className="size-5 accent-[#8c6b27]" />
              <span>
                <span className="block text-lg">Publicar no site</span>
                <span className="block text-sm text-ink-soft">Desmarque para salvar como rascunho.</span>
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" name="featured" defaultChecked={event?.featured ?? false} className="size-5 accent-[#8c6b27]" />
              <span>
                <span className="flex items-center gap-1.5 text-lg"><Star className="size-4 fill-gold text-gold" /> Destacar na página inicial</span>
                <span className="block text-sm text-ink-soft">A página inicial mostra até 6 eventos: primeiro os destacados, depois os mais recentes.</span>
              </span>
            </label>
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <button type="submit" disabled={saving || uploading} className="btn btn-primary disabled:opacity-60">
              {(saving || uploading) && <LoaderCircle className="size-4 animate-spin" />}
              {uploading ? "Enviando fotos…" : "Salvar evento"}
            </button>
            {state?.error && <p role="alert" className="text-base text-burgundy">{state.error}</p>}
          </div>
        </section>
      </form>

      {event && (
        <form
          action={deleteEventAction}
          onSubmit={(e) => { if (!confirm("Excluir este evento e todas as fotos? Esta ação não pode ser desfeita.")) e.preventDefault(); }}
          className="mt-10 border-t border-gold/30 pt-6"
        >
          <input type="hidden" name="id" value={event.id} />
          <button className="inline-flex items-center gap-2 text-base text-burgundy hover:underline">
            <Trash2 className="size-4" /> Excluir evento
          </button>
        </form>
      )}
    </>
  );
}

function IconBtn({ label, children, ...props }: { label: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" aria-label={label} title={label} className="rounded p-1.5 hover:bg-paper/20 disabled:opacity-30" {...props}>
      {children}
    </button>
  );
}
