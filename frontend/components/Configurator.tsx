"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { ArrowLeft, ArrowRight, Boxes, Clock, Download, Layers, Ruler, Star } from "lucide-react";
import { Iso } from "./Iso";
import { Num, Segmented } from "./ui";
import { dict, type Lang } from "@/lib/i18n";
import { fmt, type Design, type Maker, type Material, type Named, type Quote } from "@/lib/api";

const toLatin = (s: string) => s.replace(/[۰-۹]/g, (c) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(c)));

type Props = { lang: Lang; d: Design; materials: Material[]; cities: Named[]; makers: Maker[] };

export function Configurator({ lang, d, materials, cities, makers }: Props) {
  const t = dict[lang];
  const T = t.detail;
  const [mat, setMat] = useState(materials.find((m) => m.id === d.material) ?? materials[0]);
  const [width, setWidth] = useState(d.size[0]);
  const cityList = cities.filter((c) => makers.some((m) => m.city === c.id));
  const [city, setCity] = useState(cityList[0].id);
  const [maker, setMaker] = useState(makers.find((m) => m.city === city)!.id);
  const [install, setInstall] = useState(false);
  const [explode, setExplode] = useState(0);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    const qs = new URLSearchParams({ design: d.slug, material: mat.id, width: String(width), maker, install: String(install) });
    fetch(`/api/quote?${qs}`, { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((q) => q && setQuote(q))
      .catch(() => {});
    return () => ac.abort();
  }, [d.slug, mat.id, width, maker, install]);

  const pickCity = (c: string) => {
    setCity(c);
    setMaker(makers.find((m) => m.city === c)!.id);
  };
  const Back = lang === "fa" ? ArrowRight : ArrowLeft;
  const rows: [string, number][] = quote
    ? ([
        [t.price.maker, quote.maker_price],
        [t.price.fee, quote.fee],
        [t.price.custom, quote.custom],
        [t.price.install, quote.install],
      ] as [string, number][]).filter(([, v]) => v > 0)
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-40 pt-20 md:pb-20">
      <Link href={`/${lang}/designs`} className="press mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-fg">
        <Back className="size-4" />
        {T.back}
      </Link>
      <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
        {/* Stage */}
        <div className="self-start lg:sticky lg:top-20">
          <div
            className="grid-bg relative grid aspect-square place-items-center overflow-hidden rounded-[32px] border border-line bg-tint p-8 sm:aspect-[5/4]"
          >
            <div className="pointer-events-none absolute inset-0 opacity-40 blur-3xl" style={{ background: `radial-gradient(circle at 50% 60%, ${mat.color}, transparent 55%)` }} />
            <Iso
              parts={d.parts}
              color={mat.color}
              explode={explode}
              stretch={width / d.size[0]}
              maxExplode={1}
              maxStretch={d.range[1] / d.size[0]}
              className="relative h-full w-full drop-shadow-[0_24px_30px_rgb(0_0_0/0.16)]"
            />
            <label className="glass absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-2xl border border-line px-4 py-3 text-sm font-medium">
              <Boxes className="size-4 shrink-0 text-accent" />
              <span className="shrink-0">{T.explode}</span>
              <input type="range" min={0} max={1} step={0.01} value={explode} onChange={(e) => setExplode(+e.target.value)} className="w-full" />
            </label>
          </div>
        </div>

        {/* Controls */}
        <div>
          <p className="eyebrow">{d.designer.name[lang]}</p>
          <h1 className="display mt-1 text-4xl sm:text-5xl">{d.name[lang]}</h1>
          <p className="mt-4 leading-relaxed text-muted">{d.desc[lang]}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-sm">
            <Spec icon={Ruler}>
              <span dir="ltr">{[width, d.size[1], d.size[2]].map((n) => fmt(n, lang)).join(" × ")}</span> {t.common.cm}
            </Spec>
            <Spec icon={Boxes}>
              {fmt(d.parts.length, lang)} {T.parts}
            </Spec>
            <Spec icon={Layers}>
              {fmt(d.sheets, lang)} {T.sheets}
            </Spec>
            <Spec icon={Download}>
              {fmt(d.downloads ?? 0, lang)} {T.downloads}
            </Spec>
          </div>

          <Field label={T.material} value={mat.name[lang]}>
            <div className="flex flex-wrap gap-2.5" role="radiogroup">
              {materials.map((m) => (
                <button
                  key={m.id}
                  role="radio"
                  aria-checked={m.id === mat.id}
                  aria-label={m.name[lang]}
                  title={m.name[lang]}
                  onClick={() => setMat(m)}
                  className={`press size-11 rounded-full border border-black/10 shadow-inner ${m.id === mat.id ? "ring-2 ring-accent ring-offset-[3px] ring-offset-[var(--bg)]" : ""}`}
                  style={{ background: m.color }}
                />
              ))}
            </div>
          </Field>

          <Field label={T.width} value={`${fmt(width, lang)} ${t.common.cm}`}>
            <input
              type="range"
              min={d.range[0]}
              max={d.range[1]}
              step={5}
              value={width}
              onChange={(e) => setWidth(+e.target.value)}
              aria-label={T.width}
              className="w-full"
            />
            <div className="mt-1 flex justify-between text-xs text-muted tabular-nums">
              <span>{fmt(d.range[0], lang)}</span>
              <span>{fmt(d.range[1], lang)}</span>
            </div>
          </Field>

          <Field label={T.city}>
            <Segmented id="city" value={city} onChange={pickCity} options={cityList.map((c) => ({ id: c.id, label: c.name[lang] }))} />
          </Field>

          <Field label={T.maker}>
            <div className="grid gap-2" role="radiogroup">
              {makers
                .filter((m) => m.city === city)
                .map((m) => (
                  <button
                    key={m.id}
                    role="radio"
                    aria-checked={m.id === maker}
                    onClick={() => setMaker(m.id)}
                    className={`press flex items-center gap-3 rounded-2xl border p-3.5 text-start ${m.id === maker ? "border-accent bg-accent/5 ring-4 ring-accent/10" : "border-line bg-card hover:border-muted/40"}`}
                  >
                    <span className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${m.id === maker ? "border-accent" : "border-line"}`}>
                      {m.id === maker && <motion.span layoutId="maker-dot" className="size-2.5 rounded-full bg-accent" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{m.name[lang]}</span>
                      <span className="block truncate text-xs text-muted">{m.machine[lang]}</span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-0.5 text-xs text-muted tabular-nums">
                      <span className="flex items-center gap-1 font-semibold text-fg">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        {fmt(m.rating, lang)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {fmt(m.lead, lang)} {t.common.days}
                      </span>
                    </span>
                  </button>
                ))}
            </div>
          </Field>

          <label className="mt-6 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-line bg-card p-4">
            <span>
              <span className="block font-semibold">{T.install}</span>
              <span className="text-sm text-muted">{T.installSub}</span>
            </span>
            <input type="checkbox" checked={install} onChange={(e) => setInstall(e.target.checked)} className="peer sr-only" />
            <span className="relative h-7 w-12 shrink-0 rounded-full bg-tint transition-colors peer-checked:bg-accent peer-focus-visible:ring-4 peer-focus-visible:ring-accent/25 after:absolute after:start-0.5 after:top-0.5 after:size-6 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5" />
          </label>

          {/* Quote */}
          <div className="mt-6 rounded-[28px] border border-line bg-card p-5">
            <p className="text-sm font-semibold text-muted">{T.quote}</p>
            <div className="mt-3 space-y-2 text-sm">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <span className="text-muted">{k}</span>
                  <span className="tabular-nums">
                    <Num value={v} lang={lang} /> {t.common.toman}
                  </span>
                </div>
              ))}
              {quote && (
                <div className="flex justify-between gap-4 text-xs">
                  <span className="text-muted">↳ {t.price.royalty}</span>
                  <span className="tabular-nums text-accent">
                    <Num value={quote.royalty} lang={lang} /> {t.common.toman}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-end justify-between gap-4 border-t border-line pt-4">
              <span className="font-semibold">{t.price.total}</span>
              <span className="text-2xl font-extrabold tabular-nums">
                <Num value={quote?.total ?? 0} lang={lang} /> <span className="text-sm font-medium text-muted">{t.common.toman}</span>
              </span>
            </div>
            <p className="mt-1 text-end text-xs text-muted">
              {t.price.deposit}: <Num value={quote?.deposit ?? 0} lang={lang} /> {t.common.toman}
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setOpen(true)}
              disabled={!quote}
              className="press rounded-full bg-accent px-6 py-3.5 font-semibold text-white shadow-[0_10px_30px_-10px_var(--accent)] hover:brightness-110 disabled:opacity-50"
            >
              {T.order}
            </button>
            <a href={`/api/designs/${d.slug}/template`} download className="press flex flex-col items-center rounded-full border border-line bg-card px-6 py-2 hover:bg-tint">
              <span className="flex items-center gap-2 font-semibold">
                <Download className="size-4" /> {T.download}
              </span>
              <span className="text-[11px] text-muted">{T.downloadSub}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Phone: price + CTA always in reach, above the tab bar */}
      <div className="glass fixed inset-x-3 bottom-[calc(max(12px,env(safe-area-inset-bottom))+76px)] z-30 flex items-center justify-between gap-3 rounded-[22px] border border-line p-2 ps-4 md:hidden">
        <span className="text-sm font-bold tabular-nums">
          <Num value={quote?.total ?? 0} lang={lang} /> <span className="font-normal text-muted">{t.common.toman}</span>
        </span>
        <button onClick={() => setOpen(true)} disabled={!quote} className="press rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white">
          {T.order}
        </button>
      </div>

      <AnimatePresence>{open && quote && <OrderSheet lang={lang} onClose={() => setOpen(false)} payload={{ design: d.slug, material: mat.id, width, maker, install }} quote={quote} />}</AnimatePresence>
    </div>
  );
}

function Spec({ icon: Icon, children }: { icon: typeof Ruler; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-tint px-3 py-1.5">
      <Icon className="size-3.5 text-muted" />
      {children}
    </span>
  );
}

function Field({ label, value, children }: { label: string; value?: string; children: ReactNode }) {
  return (
    <div className="mt-6">
      <div className="mb-2.5 flex items-baseline justify-between text-sm">
        <span className="font-semibold">{label}</span>
        {value && <span className="text-muted tabular-nums">{value}</span>}
      </div>
      {children}
    </div>
  );
}

type Payload = { design: string; material: string; width: number; maker: string; install: boolean };

/** Bottom sheet: enters and leaves along the same path, drag the grabber down (or flick) to dismiss. */
function OrderSheet({ lang, onClose, payload, quote }: { lang: Lang; onClose: () => void; payload: Payload; quote: Quote }) {
  const t = dict[lang];
  const F = t.form;
  const router = useRouter();
  const drag = useDragControls();
  const [v, setV] = useState({ name: "", phone: "", address: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [onClose]);

  const check = (k: keyof typeof v, val = v[k]) => {
    const e = !val.trim() ? F.required : k === "phone" && !/^09\d{9}$/.test(toLatin(val).replace(/\s/g, "")) ? F.phoneErr : "";
    setErr((p) => ({ ...p, [k]: e }));
    return !e;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (![check("name"), check("phone"), check("address")].every(Boolean)) return;
    setBusy(true);
    setFail(false);
    const r = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, ...v, phone: toLatin(v.phone).replace(/\s/g, "") }),
    }).catch(() => null);
    if (r?.ok) {
      const { code } = await r.json();
      router.push(`/${lang}/orders/${code}?new=1`);
    } else {
      setFail(true);
      setBusy(false);
    }
  };

  const input = "w-full rounded-2xl border bg-bg px-4 py-3 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15";
  return (
    <>
      <motion.div className="fixed inset-0 z-50 bg-black/45" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        role="dialog"
        aria-modal
        aria-labelledby="sheet-title"
        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[92svh] max-w-lg overflow-y-auto rounded-t-[32px] border border-line bg-card px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-3 shadow-2xl sm:bottom-6 sm:rounded-[32px]"
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        exit={{ y: "110%" }}
        transition={{ type: "spring", bounce: 0.14, duration: 0.5 }}
        drag="y"
        dragListener={false}
        dragControls={drag}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.04, bottom: 0.9 }}
        onDragEnd={(_, i) => (i.offset.y > 110 || i.velocity.y > 550) && onClose()}
      >
        <div onPointerDown={(e) => drag.start(e)} className="-mx-6 flex cursor-grab touch-none justify-center pb-4 pt-1 active:cursor-grabbing">
          <span className="h-1.5 w-11 rounded-full bg-muted/35" />
        </div>
        <h2 id="sheet-title" className="text-2xl font-extrabold">
          {F.title}
        </h2>
        <p className="mt-1 text-sm text-muted">{F.sub}</p>
        <form onSubmit={submit} noValidate className="mt-5 space-y-4">
          {(["name", "phone", "address"] as const).map((k) => (
            <label key={k} className="block">
              <span className="mb-1.5 block text-sm font-semibold">{F[k]}</span>
              {k === "address" ? (
                <textarea
                  rows={2}
                  value={v[k]}
                  onChange={(e) => setV({ ...v, [k]: e.target.value })}
                  onBlur={() => check(k)}
                  aria-invalid={!!err[k]}
                  className={`${input} resize-none ${err[k] ? "border-red-500" : "border-line"}`}
                />
              ) : (
                <input
                  autoFocus={k === "name"}
                  value={v[k]}
                  onChange={(e) => setV({ ...v, [k]: e.target.value })}
                  onBlur={() => check(k)}
                  aria-invalid={!!err[k]}
                  inputMode={k === "phone" ? "tel" : undefined}
                  autoComplete={k === "phone" ? "tel" : "name"}
                  dir={k === "phone" ? "ltr" : undefined}
                  placeholder={k === "phone" ? "09" : undefined}
                  className={`${input} ${k === "phone" ? "text-start tabular-nums rtl:text-end" : ""} ${err[k] ? "border-red-500" : "border-line"}`}
                />
              )}
              <AnimatePresence>
                {err[k] && (
                  <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-1 block text-xs text-red-500">
                    {err[k]}
                  </motion.span>
                )}
              </AnimatePresence>
            </label>
          ))}
          <div className="flex items-center justify-between rounded-2xl bg-tint px-4 py-3 text-sm">
            <span className="text-muted">{t.price.deposit}</span>
            <span className="font-bold tabular-nums">
              {fmt(quote.deposit, lang)} {t.common.toman}
            </span>
          </div>
          {fail && <p className="text-sm text-red-500">{F.error}</p>}
          <button disabled={busy} className="press w-full rounded-full bg-accent py-3.5 font-semibold text-white hover:brightness-110 disabled:opacity-60">
            {busy ? "…" : F.submit}
          </button>
          <p className="text-center text-xs text-muted">{F.note}</p>
        </form>
      </motion.div>
    </>
  );
}
