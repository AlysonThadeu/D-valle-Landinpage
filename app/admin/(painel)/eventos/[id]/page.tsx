import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getEventById } from "@/lib/store";
import { EventForm } from "@/components/admin/EventForm";

export default async function EditEventPage({ params }: PageProps<"/admin/eventos/[id]">) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <Link href="/admin" className="inline-flex items-center gap-2 text-ink-soft hover:text-gold-deep">
          <ArrowLeft className="size-4" /> Voltar
        </Link>
        {event.published && (
          <Link href={`/eventos/${event.slug}`} target="_blank" className="inline-flex items-center gap-2 text-gold-deep">
            Ver no site <ExternalLink className="size-4" />
          </Link>
        )}
      </div>
      <h1 className="mt-3 text-4xl font-light">Editar evento</h1>
      <EventForm event={event} />
    </>
  );
}
