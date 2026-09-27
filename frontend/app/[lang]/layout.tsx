import "@fontsource-variable/vazirmatn";
import "@fontsource-variable/inter";
import "../globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo, Nav } from "@/components/Nav";
import { MotionRoot } from "@/components/ui";
import { dict, isLang, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type P = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  const t = dict[isLang(lang) ? lang : "fa"];
  return { title: { default: `${t.brandFull} · ${t.meta.title}`, template: `%s · ${t.brandFull}` }, description: t.meta.desc };
}

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f4f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0908" },
  ],
};

// Runs before paint: stored choice, else the OS setting — no flash of the wrong theme.
const themeScript = `try{var t=localStorage.getItem("theme");document.documentElement.dataset.theme=t||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")}catch(e){}`;

export default async function Layout({ children, params }: P & { children: ReactNode }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <html lang={lang} dir={lang === "fa" ? "rtl" : "ltr"} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-svh antialiased">
        <MotionRoot>
          <Nav lang={lang} />
          <main>{children}</main>
          <Footer lang={lang} />
        </MotionRoot>
      </body>
    </html>
  );
}

function Footer({ lang }: { lang: Lang }) {
  const t = dict[lang];
  return (
    <footer className="border-t border-line pb-32 pt-12 md:pb-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Link href={`/${lang}`} className="flex items-center gap-2 text-lg font-extrabold">
            <Logo /> {t.brandFull}
          </Link>
          <p className="mt-2 max-w-sm text-sm text-muted">{t.footer.tagline}</p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <Link className="hover:text-fg" href={`/${lang}/designs`}>{t.nav.designs}</Link>
          <Link className="hover:text-fg" href={`/${lang}/makers`}>{t.nav.makers}</Link>
          <Link className="hover:text-fg" href={`/${lang}/orders`}>{t.nav.orders}</Link>
        </div>
      </div>
      <div className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 text-xs text-muted">
        <span>© {lang === "fa" ? "۱۴۰۵" : "2026"} {t.brandFull} · {t.footer.rights}</span>
        <span className="rounded-full border border-line px-2.5 py-1">{t.footer.demo}</span>
      </div>
    </footer>
  );
}
