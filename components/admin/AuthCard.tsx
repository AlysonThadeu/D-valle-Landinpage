import { Frame, Monogram } from "@/components/ornaments";

/** Moldura das telas de acesso (login, esqueci a senha, definir senha). */
export function AuthCard({ script, children }: { script: string; children: React.ReactNode }) {
  return (
    <main className="lace grid min-h-[100dvh] place-items-center bg-ivory px-4 py-10">
      <div className="relative w-full max-w-md rounded-lg border border-gold/40 bg-paper px-6 py-12 shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:px-10">
        <Frame size="w-12" inset="inset-2" />
        <div className="text-center">
          <Monogram className="mx-auto h-12 text-gold" animate />
          <p className="mt-4 font-script text-4xl text-gold-deep">{script}</p>
          <p className="eyebrow mt-2">Painel D&apos;VALLE</p>
        </div>
        {children}
      </div>
    </main>
  );
}
