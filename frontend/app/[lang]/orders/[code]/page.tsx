import type { Metadata } from "next";
import * as motion from "motion/react-client";
import { Check } from "lucide-react";
import { Iso } from "@/components/Iso";
import { AutoRefresh, CopyCode, Reveal, TrackForm } from "@/components/ui";
import { api, fmt, type Order } from "@/lib/api";
import { dict, langOf, type Lang } from "@/lib/i18n";

type P = { params: Promise<{ lang: string; code: string }>; searchParams: Promise<{ new?: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang, code } = await params;
  return { title: `${dict[langOf(lang)].track.code} ${decodeURIComponent(code)}`, robots: { index: false } };
}

export default async function OrderPage({ params, searchParams }: P) {
  const { lang: l, code } = await params;
  const lang = langOf(l);
  const isNew = (await searchParams).new === "1";
  const t = dict[lang];
  const T = t.track;
  const o = await api<Order>(`/api/orders/${encodeURIComponent(decodeURIComponent(code))}`).catch(() => null);

  if (!o)
    return (
      <div className="flex min-h-[85svh] flex-col items-center justify-center px-4 pt-14 text-center">
        <h1 className="display text-5xl">{T.title}</h1>
        <p className="mt-3 max-w-sm text-muted">{T.notFound}</p>
        <div className="mt-8 flex w-full justify-center">
          <TrackForm lang={lang} initial={decodeURIComponent(code)} />
        </div>
      </div>
    );

  const last = o.stages.length - 1;
  const stretch = o.width / o.design.size[0];
  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-24">
      <AutoRefresh active={o.stage < last} />
      <Reveal>
        {isNew && (
          <div className="mb-10 flex items-center gap-4 rounded-[28px] border border-accent/25 bg-accent/10 p-5">
            <svg viewBox="0 0 52 52" className="size-12 shrink-0" aria-hidden>
              <circle cx="26" cy="26" r="24" fill="var(--accent)" />
              <motion.path
                d="M15 27l7 7 15-16"
                fill="none"
                stroke="white"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ type: "spring", bounce: 0, duration: 0.8, delay: 0.3 }}
              />
            </svg>
            <div>
              <p className="text-xl font-extrabold">{T.success}</p>
              <p className="text-sm text-muted">{T.successSub}</p>
            </div>
          </div>
        )}
        <p className="text-sm font-semibold text-muted">{T.code}</p>
        <div className="mt-1 flex flex-wrap items-center gap-4">
          <h1 dir="ltr" className="font-mono text-4xl font-extrabold tracking-wider sm:text-5xl">
            {o.code}
          </h1>
          <CopyCode code={o.code} lang={lang} />
        </div>
      </Reveal>

      <div className="mt-10 grid gap-5 lg:grid-cols-[1.15fr_1fr]">
        <Reveal>
          <ol className="rounded-[32px] border border-line bg-card p-6 sm:p-8">
            {o.stages.map((s, i) => {
              const done = i < o.stage || o.stage === last;
              const now = i === o.stage && !done;
              return (
                <li key={s} className="relative flex gap-4 pb-9 last:pb-0">
                  {i < last && <span className={`absolute bottom-0 start-[15px] top-9 w-0.5 rounded-full ${i < o.stage ? "bg-accent" : "bg-line"}`} />}
                  <span
                    className={`relative grid size-8 shrink-0 place-items-center rounded-full ${done ? "bg-accent text-white" : now ? "bg-accent/15 ring-4 ring-accent/15" : "bg-tint text-muted"}`}
                  >
                    {done ? (
                      <Check className="size-4" strokeWidth={3} />
                    ) : now ? (
                      <>
                        <span className="absolute inset-0 animate-ping rounded-full bg-accent/30" />
                        <span className="size-2.5 rounded-full bg-accent" />
                      </>
                    ) : (
                      <span className="text-xs font-bold">{fmt(i + 1, lang)}</span>
                    )}
                  </span>
                  <div className="pt-1">
                    <p className={`font-semibold ${done || now ? "" : "text-muted"}`}>{T.stages[s]}</p>
                    {now && <p className="text-sm font-medium text-accent">{T.now}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-[32px] border border-line bg-card p-6">
            <p className="text-sm font-semibold text-muted">{T.summary}</p>
            <div className="grid-bg mt-4 grid aspect-[4/3] place-items-center rounded-[24px] bg-tint p-8">
              <Iso parts={o.design.parts} color={o.material.color} stretch={stretch} maxStretch={stretch} className="h-full w-full" />
            </div>
            <p className="mt-5 text-xl font-extrabold">{o.design.name[lang]}</p>
            <p className="mt-1 text-sm text-muted">
              {o.material.name[lang]} · {fmt(o.width, lang)} {t.common.cm} · {o.maker.name[lang]}
            </p>
            <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm">
              {(
                [
                  [t.price.total, o.quote.total],
                  [T.paid, o.quote.deposit],
                  [T.remaining, o.quote.total - o.quote.deposit],
                ] as const
              ).map(([k, v], i) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className={i ? "text-muted" : "font-semibold"}>{k}</dt>
                  <dd className={`tabular-nums ${i ? "" : "font-bold"}`}>
                    {fmt(v, lang)} {t.common.toman}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
