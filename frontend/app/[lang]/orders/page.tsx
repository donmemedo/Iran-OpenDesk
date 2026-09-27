import type { Metadata } from "next";
import { Package } from "lucide-react";
import { Reveal, TrackForm } from "@/components/ui";
import { dict, langOf, type Lang } from "@/lib/i18n";

type P = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  return { title: dict[langOf((await params).lang)].track.title };
}

export default async function Orders({ params }: P) {
  const lang = langOf((await params).lang);
  const t = dict[lang].track;
  return (
    <div className="grid-bg flex min-h-[85svh] items-center justify-center px-4 pt-14 [mask-image:linear-gradient(black_70%,transparent)]">
      <Reveal className="flex w-full flex-col items-center text-center">
        <div className="grid size-16 place-items-center rounded-[20px] border border-line bg-card shadow-sm">
          <Package className="size-7 text-accent" />
        </div>
        <h1 className="display mt-6 text-5xl sm:text-6xl">{t.title}</h1>
        <p className="mt-3 text-muted">{t.sub}</p>
        <div className="mt-8 flex w-full justify-center">
          <TrackForm lang={lang} />
        </div>
      </Reveal>
    </div>
  );
}
