"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion, useInView, useMotionValueEvent, useSpring } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Copy, Search } from "lucide-react";
import { Iso } from "./Iso";
import { dict, type Lang } from "@/lib/i18n";
import { fmt, mil, type Design, type Named } from "@/lib/api";

const spring = { type: "spring", bounce: 0, duration: 0.7 } as const;

export function MotionRoot({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ ...spring, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Number that springs to its value (counts up when first scrolled into view). */
export function Num({ value, lang, className }: { value: number; lang: Lang; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useSpring(0, { bounce: 0, duration: 0.9 });
  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);
  useMotionValueEvent(mv, "change", (v) => {
    if (ref.current) ref.current.textContent = fmt(Math.round(v), lang);
  });
  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {fmt(0, lang)}
    </span>
  );
}

export function Segmented<T extends string>({
  id,
  value,
  options,
  onChange,
}: {
  id: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" className="no-scrollbar inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-tint p-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={`press relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${value === o.id ? "" : "text-muted hover:text-fg"}`}
        >
          {value === o.id && (
            <motion.span layoutId={id} className="absolute inset-0 rounded-full bg-card shadow-sm" transition={{ type: "spring", bounce: 0.15, duration: 0.45 }} />
          )}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

/** Card whose furniture gently comes apart on hover — the CNC idea in one gesture. */
export function DesignCard({ d, lang, className = "" }: { d: Design; lang: Lang; className?: string }) {
  const t = dict[lang];
  const mv = useSpring(0, { bounce: 0, duration: 0.5 });
  const [e, setE] = useState(0);
  useMotionValueEvent(mv, "change", setE);
  const on = () => mv.set(0.32);
  const off = () => mv.set(0);
  return (
    <Link
      href={`/${lang}/designs/${d.slug}`}
      onPointerEnter={on}
      onPointerLeave={off}
      onFocus={on}
      onBlur={off}
      className={`press group block rounded-[28px] border border-line bg-card p-2.5 hover:shadow-[0_24px_60px_-24px_rgb(0_0_0/0.35)] ${className}`}
    >
      <div className="grid-bg grid aspect-[4/3] place-items-center rounded-[22px] bg-tint p-7">
        <Iso parts={d.parts} color={d.color} explode={e} maxExplode={0.32} className="h-full w-full" />
      </div>
      <div className="flex items-end justify-between gap-3 px-3 pb-2 pt-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold">{d.name[lang]}</h3>
          <p className="truncate text-sm text-muted">{d.designer.name[lang]}</p>
        </div>
        <p className="shrink-0 text-end text-sm">
          <span className="text-muted">{t.common.from} </span>
          <span className="font-bold tabular-nums">{mil(d.from, lang)}</span>
          <span className="text-muted"> {t.common.million}</span>
        </p>
      </div>
    </Link>
  );
}

export function Catalog({ lang, designs, categories }: { lang: Lang; designs: Design[]; categories: Named[] }) {
  const t = dict[lang].catalog;
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const needle = q.trim().toLowerCase();
  const list = designs.filter(
    (d) =>
      (cat === "all" || d.category === cat) &&
      [d.name.fa, d.name.en, d.designer.name.fa, d.designer.name.en].join(" ").toLowerCase().includes(needle),
  );
  return (
    <>
      <div className="glass sticky top-14 z-30 -mx-4 flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.search}
            aria-label={t.search}
            className="w-full rounded-full border border-line bg-card py-2.5 pe-4 ps-11 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15"
          />
        </label>
        <Segmented id="cat" value={cat} onChange={setCat} options={[{ id: "all", label: t.all }, ...categories.map((c) => ({ id: c.id, label: c.name[lang] }))]} />
      </div>
      <motion.div layout className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map((d) => (
            <motion.div
              key={d.slug}
              layout
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ type: "spring", bounce: 0, duration: 0.45 }}
            >
              <DesignCard d={d} lang={lang} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {!list.length && <p className="py-24 text-center text-muted">{t.empty}</p>}
    </>
  );
}

export function TrackForm({ lang, initial = "" }: { lang: Lang; initial?: string }) {
  const t = dict[lang].track;
  const router = useRouter();
  const [code, setCode] = useState(initial);
  const Arrow = lang === "fa" ? ArrowLeft : ArrowRight;
  return (
    <form
      className="flex w-full max-w-md gap-2 rounded-full border border-line bg-card p-1.5 shadow-sm focus-within:border-accent"
      onSubmit={(e) => {
        e.preventDefault();
        if (code.trim()) router.push(`/${lang}/orders/${encodeURIComponent(code.trim().toUpperCase())}`);
      }}
    >
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={t.placeholder}
        aria-label={t.code}
        dir="ltr"
        className="min-w-0 flex-1 bg-transparent px-4 font-mono tracking-wider outline-none placeholder:font-sans placeholder:tracking-normal"
      />
      <button className="press flex items-center gap-2 rounded-full bg-fg px-5 py-2.5 font-semibold text-bg">
        {t.go} <Arrow className="size-4" />
      </button>
    </form>
  );
}

/** Re-fetches the server-rendered order while it is still moving. */
export function AutoRefresh({ active }: { active: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => router.refresh(), 10_000);
    return () => clearInterval(id);
  }, [active, router]);
  return null;
}

export function CopyCode({ code, lang }: { code: string; lang: Lang }) {
  const t = dict[lang].track;
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard?.writeText(code).then(() => (setDone(true), setTimeout(() => setDone(false), 1600)))}
      className="press inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-sm font-medium"
    >
      {done ? <Check className="size-4 text-accent" /> : <Copy className="size-4" />}
      {done ? t.copied : t.copy}
    </button>
  );
}
