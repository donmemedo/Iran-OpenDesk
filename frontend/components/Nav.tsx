"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { Factory, House, LayoutGrid, Moon, Package, Sun } from "lucide-react";
import { dict, type Lang } from "@/lib/i18n";

export function Logo({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <path d="M32 8 54 20 32 32 10 20Z" fill="#F0D2A8" />
      <path d="M10 20 32 32v24L10 44Z" fill="#E3A15F" />
      <path d="M54 20 32 32v24l22-12Z" fill="var(--accent)" />
    </svg>
  );
}

function toggleTheme(e: MouseEvent) {
  const root = document.documentElement;
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  const apply = () => {
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };
  if (!("startViewTransition" in document) || matchMedia("(prefers-reduced-motion: reduce)").matches) return apply();
  // Circular reveal that grows out of the button
  const { clientX: x, clientY: y } = e;
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  document.startViewTransition(apply).ready.then(() =>
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 700, easing: "cubic-bezier(.2,.8,.2,1)", pseudoElement: "::view-transition-new(root)" },
    ),
  );
}

export function Nav({ lang }: { lang: Lang }) {
  const t = dict[lang].nav;
  const path = usePathname();
  const rest = path.replace(/^\/(fa|en)/, "");
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 8));

  const links = [
    { href: "", label: t.home, icon: House },
    { href: "/designs", label: t.designs, icon: LayoutGrid },
    { href: "/makers", label: t.makers, icon: Factory },
    { href: "/orders", label: t.ordersShort, icon: Package, long: t.orders },
  ];
  const active = (h: string) => (h ? rest.startsWith(h) : rest === "");

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow] duration-300 ${scrolled ? "glass shadow-[0_1px_0_var(--line)]" : ""}`}
      >
        <nav className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
          <Link href={`/${lang}`} className="press me-4 flex items-center gap-2 text-[1.05rem] font-extrabold">
            <Logo />
            {dict[lang].brand}
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {links.slice(1).map((l) => (
              <Link
                key={l.href}
                href={`/${lang}${l.href}`}
                className={`press relative rounded-full px-3.5 py-1.5 text-sm font-medium ${active(l.href) ? "" : "text-muted hover:text-fg"}`}
              >
                {active(l.href) && <motion.span layoutId="nav-top" className="absolute inset-0 rounded-full bg-tint" transition={{ type: "spring", bounce: 0.15, duration: 0.45 }} />}
                <span className="relative">{l.long ?? l.label}</span>
              </Link>
            ))}
          </div>
          <div className="ms-auto flex items-center gap-1">
            <Link
              href={`/${lang === "fa" ? "en" : "fa"}${rest}`}
              hrefLang={lang === "fa" ? "en" : "fa"}
              className="press rounded-full px-3 py-1.5 text-sm font-semibold hover:bg-tint"
            >
              {t.lang}
            </Link>
            <button onClick={toggleTheme} aria-label={t.theme} className="press grid size-9 place-items-center rounded-full hover:bg-tint">
              <Sun className="size-[18px] dark:hidden" />
              <Moon className="hidden size-[18px] dark:block" />
            </button>
          </div>
        </nav>
      </header>

      {/* App-style tab bar on phones — ready for the PWA / native shells */}
      <nav className="glass fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-40 flex justify-around rounded-[26px] border border-line p-1.5 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.35)] md:hidden">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={`/${lang}${href}`}
            className={`press relative flex flex-1 flex-col items-center gap-0.5 rounded-[20px] py-1.5 text-[11px] font-semibold ${active(href) ? "text-accent" : "text-muted"}`}
          >
            {active(href) && <motion.span layoutId="nav-tab" className="absolute inset-0 rounded-[20px] bg-tint" transition={{ type: "spring", bounce: 0.2, duration: 0.45 }} />}
            <Icon className="relative size-[22px]" strokeWidth={active(href) ? 2.4 : 1.8} />
            <span className="relative">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
