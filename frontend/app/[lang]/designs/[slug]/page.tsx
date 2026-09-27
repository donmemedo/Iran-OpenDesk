import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Configurator } from "@/components/Configurator";
import { api, type Design, type Maker, type Meta } from "@/lib/api";
import { langOf } from "@/lib/i18n";

type P = { params: Promise<{ lang: string; slug: string }> };

const getDesign = (slug: string) => api<Design>(`/api/designs/${encodeURIComponent(slug)}`).catch(() => null);

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang, slug } = await params;
  const d = await getDesign(slug);
  return d ? { title: d.name[langOf(lang)], description: d.desc[langOf(lang)] } : {};
}

export default async function DesignPage({ params }: P) {
  const { lang, slug } = await params;
  const [d, meta, makers] = await Promise.all([getDesign(slug), api<Meta>("/api/meta"), api<Maker[]>("/api/makers")]);
  if (!d) notFound();
  return <Configurator lang={langOf(lang)} d={d} materials={meta.materials} cities={meta.cities} makers={makers} />;
}
