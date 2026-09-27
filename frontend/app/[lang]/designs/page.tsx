import type { Metadata } from "next";
import { Catalog, Reveal } from "@/components/ui";
import { api, type Design, type Meta } from "@/lib/api";
import { dict, langOf, type Lang } from "@/lib/i18n";

type P = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  return { title: dict[langOf((await params).lang)].catalog.title };
}

export default async function Designs({ params }: P) {
  const lang = langOf((await params).lang);
  const t = dict[lang].catalog;
  const [designs, meta] = await Promise.all([api<Design[]>("/api/designs"), api<Meta>("/api/meta")]);
  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-24">
      <Reveal>
        <h1 className="display text-5xl sm:text-7xl">{t.title}</h1>
        <p className="mt-3 max-w-xl text-lg text-muted">{t.sub}</p>
      </Reveal>
      <div className="mt-8">
        <Catalog lang={lang} designs={designs} categories={meta.categories} />
      </div>
    </div>
  );
}
