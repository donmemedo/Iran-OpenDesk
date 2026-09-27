import type { Lang } from "./i18n";

export type L = { fa: string; en: string };
export type Box = number[];
export type Design = {
  slug: string;
  name: L;
  desc: L;
  category: string;
  designer: { id: string; name: L; royalty: number };
  material: string;
  color: string;
  price: number;
  from: number;
  size: [number, number, number];
  range: [number, number];
  parts: Box[];
  sheets: number;
  downloads?: number;
};
export type Maker = { id: string; name: L; city: string; rating: number; lead: number; factor: number; orders: number; machine: L };
export type Material = { id: string; name: L; color: string; factor: number };
export type Named = { id: string; name: L };
export type Meta = {
  materials: Material[];
  cities: Named[];
  categories: Named[];
  stats: { designs: number; makers: number; cities: number; designers: number; downloads: number };
};
export type Quote = { maker_price: number; fee: number; royalty: number; custom: number; install: number; total: number; deposit: number };
export type Order = {
  code: string;
  stage: number;
  stages: string[];
  design: Pick<Design, "slug" | "name" | "parts" | "size">;
  maker: Maker;
  material: Material;
  width: number;
  install: boolean;
  name: string;
  phone: string;
  quote: Quote;
};

// Server components call the backend directly; the browser goes through the /api rewrite.
export async function api<T>(path: string): Promise<T> {
  const r = await fetch((process.env.BACKEND_URL ?? "http://localhost:8000") + path, { cache: "no-store" });
  if (!r.ok) throw new Error(`${r.status} ${path}`);
  return r.json();
}

export const fmt = (n: number, lang: Lang) => new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US").format(n);
export const mil = (n: number, lang: Lang) => fmt(Math.round(n / 100_000) / 10, lang);
