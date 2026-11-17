import Image from "next/image";
import { Reveal } from "./Reveal";
import { Facts } from "./Facts";
import { Corner, Divider } from "@/components/ornaments";
import portrait from "@/public/images/talyson-oberto.jpg";


export function About() {
  return (
    <section id="sobre" className="py-[clamp(4rem,8vw,8rem)]">
      <div className="mx-auto grid max-w-[1280px] items-center gap-14 px-6 md:grid-cols-[0.85fr_1.15fr] md:gap-20">
        <Reveal className="relative mx-auto w-full max-w-[24rem]">
          <div className="absolute -inset-3 rounded-t-[999px] border border-gold/50" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] bg-ink">
            <Image src={portrait} alt="Talyson Oberto, cerimonialista da D'VALLE Assessoria" fill sizes="(min-width: 768px) 24rem, 90vw" className="object-cover object-top" placeholder="blur" />
          </div>
          <Corner className="absolute -bottom-6 -right-6 w-20 rotate-180 text-gold" />
          <p className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-paper px-4 font-script text-4xl text-gold-deep">Talyson Oberto</p>
        </Reveal>

        <div>
          <Reveal>
            <p className="eyebrow">Quem conduz</p>
            <h2 className="mt-4 text-[clamp(2.1rem,4.5vw,3.25rem)] font-light leading-[1.08]">
              Cuidado de quem entende que cada detalhe <em className="text-gold-deep">conta uma história</em>.
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="mt-7 space-y-5 text-lg leading-relaxed text-ink-soft">
            <p>
              Sou Talyson Oberto, cerimonialista à frente da D&apos;VALLE. Acompanho casais desde a primeira ideia até a última música,
              com organização firme e um olhar atento para o que torna cada celebração única.
            </p>
            <p>
              Meu trabalho é tirar o peso das decisões dos seus ombros: escolher bons parceiros, manter o planejamento em dia e,
              no grande dia, garantir que tudo aconteça no tempo certo, enquanto vocês vivem cada minuto.
            </p>
          </Reveal>
          <div>
            <Divider className="mx-auto mt-9 block md:mx-0" />
            <Facts />
          </div>
        </div>
      </div>
    </section>
  );
}
