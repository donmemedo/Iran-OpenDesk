import Link from "next/link";
import * as motion from "motion/react-client";
import { ArrowLeft, ArrowRight, Download, MapPin, PenTool, Truck } from "lucide-react";
import { Hero } from "@/components/Hero";
import { Iso } from "@/components/Iso";
import { JoinCta } from "@/components/JoinCta";
import { DesignCard, Num, Reveal } from "@/components/ui";
import { api, fmt, type Design, type Maker, type Meta, type Quote } from "@/lib/api";
import { dict, langOf, type Lang } from "@/lib/i18n";

const SHEET = [
  [6, 6, 138, 68],
  [150, 6, 88, 32],
  [150, 44, 88, 30],
  [6, 80, 100, 36],
  [112, 80, 58, 36],
  [176, 80, 62, 36],
];

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const lang = langOf((await params).lang);
  const t = dict[lang];
  const [designs, meta, makers] = await Promise.all([api<Design[]>("/api/designs"), api<Meta>("/api/meta"), api<Maker[]>("/api/makers")]);
  const by = (slug: string) => designs.find((d) => d.slug === slug) ?? designs[0];
  const desk = by("sarv-desk");
  const maker = makers.find((m) => m.factor === 1) ?? makers[0];
  const q = await api<Quote>(`/api/quote?design=${desk.slug}&material=birch_ply&width=${desk.size[0]}&maker=${maker.id}`);
  const Arrow = lang === "fa" ? ArrowLeft : ArrowRight;
  const pct = (n: number) => `${(n / q.total) * 100}%`;

  return (
    <>
      <Hero lang={lang} parts={desk.parts} materials={meta.materials} />

      {/* One design, three ways */}
      <section id="ways" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-24 sm:py-32">
        <Reveal>
          <p className="eyebrow">{t.ways.eyebrow}</p>
          <h2 className="display mt-3 max-w-3xl text-4xl sm:text-6xl">{t.ways.title}</h2>
        </Reveal>
        <div className="mt-12 grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
          <Reveal className="lg:col-span-2 lg:row-span-2">
            <Link
              href={`/${lang}/designs`}
              className="press group relative isolate flex h-full min-h-[440px] flex-col overflow-hidden rounded-[32px] bg-fg p-8 text-bg sm:p-10"
            >
              <div className="absolute -bottom-40 end-0 -z-10 size-[30rem] rounded-full bg-accent opacity-30 blur-[110px] transition-opacity group-hover:opacity-50" />
              <Truck className="size-8 text-accent" />
              <h3 className="mt-5 text-3xl font-extrabold sm:text-4xl">{t.ways.made.t}</h3>
              <p className="mt-3 max-w-sm opacity-70">{t.ways.made.d}</p>
              <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-bg/10 px-4 py-2 text-sm font-semibold">
                {t.hero.cta} <Arrow className="size-4" />
              </span>
              <Iso
                parts={by("kandoo-shelf").parts}
                color="#E3C295"
                className="absolute -bottom-6 end-4 -z-10 h-[62%] w-auto transition-transform duration-700 group-hover:-translate-y-2 sm:end-12"
              />
              <Iso parts={by("gaz-stool").parts} color="#C48E57" className="absolute bottom-6 end-[46%] -z-10 hidden h-[22%] w-auto sm:block" />
            </Link>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="flex h-full flex-col rounded-[32px] border border-line bg-card p-7">
              <Download className="size-7 text-accent" />
              <h3 className="mt-4 text-2xl font-extrabold">{t.ways.diy.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t.ways.diy.d}</p>
              <svg viewBox="0 0 244 122" className="mt-6 w-full rounded-2xl bg-[#f1e3cd] dark:bg-[#2a2219]" aria-hidden>
                {SHEET.map(([x, y, w, h], i) => (
                  <rect key={i} x={x} y={y} width={w} height={h} rx="2" fill="none" stroke="var(--accent)" strokeWidth="1.3" strokeDasharray="5 2" className="cut" />
                ))}
              </svg>
            </div>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="flex h-full flex-col rounded-[32px] border border-line bg-card p-7">
              <PenTool className="size-7 text-accent" />
              <h3 className="mt-4 text-2xl font-extrabold">{t.ways.designer.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t.ways.designer.d}</p>
              <p className="mt-auto pt-6">
                <span className="display bg-linear-to-r from-accent to-[#e0a060] bg-clip-text text-6xl text-transparent">
                  {fmt(5, lang)}–{fmt(8, lang)}
                  {t.common.percent}
                </span>
                <span className="mt-1 block text-sm text-muted">{t.ways.designer.rate}</span>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Transparent pricing */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 lg:grid-cols-2">
        <Reveal>
          <p className="eyebrow">{t.price.eyebrow}</p>
          <h2 className="display mt-3 text-4xl sm:text-6xl">{t.price.title}</h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">{t.price.sub}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="rounded-[32px] border border-line bg-card p-6 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.3)] sm:p-8">
            <div className="flex items-center gap-4">
              <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-tint p-2.5">
                <Iso parts={desk.parts} color="#E3C295" className="h-full w-full" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted">{t.price.example}</p>
                <p className="text-lg font-bold">{desk.name[lang]}</p>
                <p className="text-sm text-muted">{maker.name[lang]}</p>
              </div>
            </div>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", bounce: 0, duration: 1.4, delay: 0.2 }}
              style={{ originX: lang === "fa" ? 1 : 0 }}
              className="mt-7 flex h-3.5 gap-1 overflow-hidden"
            >
              <div className="rounded-full bg-fg/85" style={{ width: pct(q.maker_price) }} />
              <div className="relative overflow-hidden rounded-full bg-accent" style={{ width: pct(q.fee) }}>
                <div
                  className="absolute inset-y-0 start-0 bg-[repeating-linear-gradient(45deg,rgb(255_255_255/0.55)_0_3px,transparent_3px_7px)]"
                  style={{ width: `${(q.royalty / q.fee) * 100}%` }}
                />
              </div>
            </motion.div>
            <dl className="mt-6 space-y-3 text-sm">
              {(
                [
                  [t.price.maker, q.maker_price, "bg-fg/85"],
                  [t.price.fee, q.fee, "bg-accent"],
                  [t.price.royalty, q.royalty, "bg-[repeating-linear-gradient(45deg,var(--accent)_0_2px,transparent_2px_4px)]"],
                ] as const
              ).map(([k, v, c]) => (
                <div key={k} className="flex items-center justify-between gap-4">
                  <dt className="flex items-center gap-2.5 text-muted">
                    <span className={`size-3 rounded-full ${c}`} />
                    {k}
                  </dt>
                  <dd className="tabular-nums">
                    {fmt(v, lang)} {t.common.toman}
                  </dd>
                </div>
              ))}
              <div className="flex items-end justify-between gap-4 border-t border-line pt-4">
                <dt className="font-semibold">{t.price.total}</dt>
                <dd className="text-2xl font-extrabold tabular-nums">
                  <Num value={q.total} lang={lang} /> <span className="text-sm font-medium text-muted">{t.common.toman}</span>
                </dd>
              </div>
            </dl>
          </div>
        </Reveal>
      </section>

      {/* Featured — native scroll-snap carousel, momentum for free */}
      <section className="py-24">
        <div className="mx-auto flex max-w-6xl items-end justify-between gap-4 px-4">
          <Reveal>
            <h2 className="display text-4xl sm:text-6xl">{t.featured.title}</h2>
          </Reveal>
          <Link href={`/${lang}/designs`} className="press inline-flex shrink-0 items-center gap-1.5 rounded-full bg-tint px-4 py-2 text-sm font-semibold">
            {t.featured.all} <Arrow className="size-4" />
          </Link>
        </div>
        <div
          className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-8"
          style={{ paddingInline: "max(1rem, calc((100vw - 72rem) / 2 + 1rem))", scrollPaddingInline: "max(1rem, calc((100vw - 72rem) / 2 + 1rem))" }}
        >
          {designs.map((d) => (
            <DesignCard key={d.slug} d={d} lang={lang} className="w-[78vw] max-w-[340px] shrink-0 snap-start" />
          ))}
        </div>
      </section>

      {/* Network stats */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <h2 className="display text-center text-4xl sm:text-6xl">{t.stats.title}</h2>
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {(
            [
              [meta.stats.designs, t.stats.designs],
              [meta.stats.makers, t.stats.makers],
              [meta.stats.cities, t.stats.cities],
              [meta.stats.designers, t.stats.designers],
            ] as const
          ).map(([n, label], i) => (
            <Reveal key={label} delay={i * 0.06}>
              <div className="rounded-[28px] border border-line bg-card px-4 py-8 text-center">
                <Num value={n} lang={lang} className="display block text-6xl sm:text-7xl" />
                <p className="mt-2 text-sm text-muted sm:text-base">{label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Cities */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <Reveal>
          <p className="eyebrow">{t.cities.eyebrow}</p>
          <h2 className="display mt-3 text-4xl sm:text-6xl">{t.cities.title}</h2>
          <p className="mt-4 max-w-xl text-lg text-muted">{t.cities.sub}</p>
        </Reveal>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {meta.cities.map((c, i) => {
            const ms = makers.filter((m) => m.city === c.id);
            const lead = Math.round(ms.reduce((s, m) => s + m.lead, 0) / (ms.length || 1));
            return (
              <Reveal key={c.id} delay={i * 0.05}>
                <Link href={`/${lang}/makers`} className="press group block rounded-[28px] border border-line bg-card p-5 hover:border-accent/40">
                  <MapPin className="size-5 text-accent transition-transform group-hover:-translate-y-0.5" />
                  <p className="mt-8 text-2xl font-extrabold">{c.name[lang]}</p>
                  <p className="mt-1 text-sm text-muted">
                    {fmt(ms.length, lang)} {t.cities.makers}
                  </p>
                  <p className="text-sm text-muted">
                    {t.cities.lead}: {fmt(lead, lang)} {t.common.days}
                  </p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <JoinCta lang={lang} parts={by("zagros-partition").parts} />
      </section>
    </>
  );
}
