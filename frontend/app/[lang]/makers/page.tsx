import type { Metadata } from "next";
import { Clock, Factory, MapPin, Star } from "lucide-react";
import { JoinCta } from "@/components/JoinCta";
import { Reveal } from "@/components/ui";
import { api, fmt, type Design, type Maker, type Meta } from "@/lib/api";
import { dict, langOf, type Lang } from "@/lib/i18n";

type P = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  return { title: dict[langOf((await params).lang)].makers.title };
}

export default async function Makers({ params }: P) {
  const lang = langOf((await params).lang);
  const t = dict[lang];
  const [makers, meta, designs] = await Promise.all([api<Maker[]>("/api/makers"), api<Meta>("/api/meta"), api<Design[]>("/api/designs")]);
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-24">
      <Reveal>
        <h1 className="display text-5xl sm:text-7xl">{t.makers.title}</h1>
        <p className="mt-3 max-w-xl text-lg text-muted">{t.makers.sub}</p>
      </Reveal>
      {meta.cities.map((c) => {
        const ms = makers.filter((m) => m.city === c.id);
        if (!ms.length) return null;
        return (
          <section key={c.id} className="mt-14">
            <Reveal>
              <h2 className="flex items-center gap-2 text-2xl font-extrabold">
                <MapPin className="size-5 text-accent" />
                {c.name[lang]}
                <span className="text-base font-medium text-muted">
                  · {fmt(ms.length, lang)} {t.cities.makers}
                </span>
              </h2>
            </Reveal>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ms.map((m, i) => (
                <Reveal key={m.id} delay={i * 0.06}>
                  <article className="rounded-[28px] border border-line bg-card p-5 transition-shadow hover:shadow-[0_24px_60px_-30px_rgb(0_0_0/0.35)]">
                    <div className="flex items-start justify-between">
                      <div className="grid size-12 place-items-center rounded-2xl bg-tint">
                        <Factory className="size-5 text-accent" />
                      </div>
                      <span className="flex items-center gap-1 rounded-full bg-tint px-2.5 py-1 text-sm font-semibold tabular-nums">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        {fmt(m.rating, lang)}
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-bold">{m.name[lang]}</h3>
                    <p className="text-sm text-muted">{m.machine[lang]}</p>
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t border-line pt-4 text-sm text-muted">
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        <b className="text-fg tabular-nums">{fmt(m.lead, lang)}</b> {t.common.days}
                      </span>
                      <span>
                        <b className="text-fg tabular-nums">{fmt(m.orders, lang)}</b> {t.makers.orders}
                      </span>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>
        );
      })}
      <div className="mt-20">
        <JoinCta lang={lang} parts={(designs.find((d) => d.slug === "zagros-partition") ?? designs[0]).parts} />
      </div>
    </div>
  );
}
