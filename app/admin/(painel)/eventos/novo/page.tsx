import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EventForm } from "@/components/admin/EventForm";

export default function NewEventPage() {
  return (
    <>
      <Link href="/admin" className="inline-flex items-center gap-2 text-ink-soft hover:text-gold-deep">
        <ArrowLeft className="size-4" /> Voltar
      </Link>
      <h1 className="mt-3 text-4xl font-light">Novo evento</h1>
      <EventForm />
    </>
  );
}
