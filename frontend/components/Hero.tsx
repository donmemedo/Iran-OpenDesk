"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { Iso } from "./Iso";
import { dict, type Lang } from "@/lib/i18n";
import { fmt, type Box, type Material } from "@/lib/api";

/** Scroll-driven assembly: the desk flies in as loose CNC parts and snaps together as you scroll. */
export function Hero({ lang, parts, materials }: { lang: Lang; parts: Box[]; materials: Material[] }) {
  const t = dict[lang].hero;
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const intro = useMotionValue(reduce ? 0 : 2.4);
  useEffect(() => {
    if (reduce) return intro.set(0);
    const c = animate(intro, 1, { type: "spring", bounce: 0, duration: 1.9, delay: 0.2 });
    return () => c.stop();
  }, [reduce, intro]);
  const explode = useTransform(() => intro.get() * Math.max(0, 1 - scrollYProgress.get() / 0.7));
  const [e, setE] = useState(explode.get());
  useMotionValueEvent(explode, "change", setE);
  const [mat, setMat] = useState(materials[0]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const hint = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  const Arrow = lang === "fa" ? ArrowLeft : ArrowRight;

  return (
    <section ref={ref} className="relative h-[230svh]">
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        <div className="grid-bg absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_72%)]" />
        <div
          className="pointer-events-none absolute left-1/2 top-[58%] size-[80vmax] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.16] blur-3xl dark:opacity-[0.28] lg:left-[62%] rtl:lg:left-[38%]"
          style={{ background: `radial-gradient(circle, ${mat.color}, var(--accent) 35%, transparent 62%)` }}
        />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-2 px-4 pt-14 lg:grid-cols-[1fr_1.2fr] lg:gap-10">
          <motion.div style={{ y: textY }} className="text-center lg:text-start">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.8 }}
              className="glass mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs font-semibold sm:text-sm lg:mx-0"
            >
              <span className="size-1.5 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
              {t.eyebrow}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ type: "spring", bounce: 0, duration: 1.1, delay: 0.05 }}
              className="display text-[clamp(2.3rem,7.2vw,5.4rem)] rtl:text-[clamp(2rem,5.2vw,4.2rem)]"
            >
              {t.title1}
              <br />
              <span className="bg-linear-to-r from-accent via-[#ff8a3d] to-[#e0a060] bg-clip-text text-transparent">{t.title2}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 1, delay: 0.15 }}
              className="mx-auto mt-5 max-w-md text-[0.95rem] leading-relaxed text-muted sm:text-lg lg:mx-0"
            >
              {t.sub}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 1, delay: 0.25 }}
              className="mt-7 flex justify-center gap-3 lg:justify-start"
            >
              <Link
                href={`/${lang}/designs`}
                className="press group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-white shadow-[0_10px_30px_-8px_var(--accent)] hover:brightness-110"
              >
                {t.cta}
                <Arrow className="size-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
              </Link>
              <a href="#ways" className="press glass inline-flex items-center rounded-full border border-line px-6 py-3 font-semibold hover:bg-tint">
                {t.how}
              </a>
            </motion.div>
          </motion.div>

          <div className="relative">
            <Iso parts={parts} color={mat.color} explode={e} maxExplode={1.05} className="mx-auto h-auto max-h-[42svh] w-full overflow-visible drop-shadow-[0_30px_40px_rgb(0_0_0/0.18)] lg:max-h-[68svh]" />
            <div className="mt-3 flex items-center justify-center gap-3 lg:justify-between">
              <div className="glass rounded-full border border-line px-3.5 py-1.5 text-sm font-semibold tabular-nums">
                {t.assembly} {fmt(Math.round((1 - Math.min(e, 1)) * 100), lang)}
                {dict[lang].common.percent}
              </div>
              <div className="glass flex gap-1.5 rounded-full border border-line p-1.5" role="radiogroup">
                {materials.map((m) => (
                  <button
                    key={m.id}
                    role="radio"
                    aria-checked={m.id === mat.id}
                    aria-label={m.name[lang]}
                    title={m.name[lang]}
                    onClick={() => setMat(m)}
                    className={`press size-6 rounded-full border border-black/10 transition-shadow ${m.id === mat.id ? "ring-2 ring-accent ring-offset-2 ring-offset-[var(--card)]" : ""}`}
                    style={{ background: m.color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <motion.div style={{ opacity: hint }} className="absolute inset-x-0 bottom-24 flex flex-col items-center gap-1 text-xs text-muted md:bottom-8">
          {t.hint}
          <ChevronDown className="size-4 animate-bounce" />
        </motion.div>
      </div>
    </section>
  );
}
