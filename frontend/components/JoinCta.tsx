import { Iso } from "./Iso";
import { Reveal } from "./ui";
import { dict, type Lang } from "@/lib/i18n";
import type { Box } from "@/lib/api";

export function JoinCta({ lang, parts }: { lang: Lang; parts: Box[] }) {
  const t = dict[lang].join;
  return (
    <Reveal>
      <div className="relative isolate overflow-hidden rounded-[36px] bg-fg px-7 py-14 text-bg sm:px-14 sm:py-20">
        <div className="absolute -end-24 -top-24 -z-10 size-[28rem] rounded-full bg-accent opacity-40 blur-[100px]" />
        <Iso parts={parts} color="#E3C295" className="absolute -bottom-10 -end-10 -z-10 w-[60%] max-w-md opacity-25 sm:opacity-90" />
        <h2 className="display max-w-lg text-4xl sm:text-6xl">{t.title}</h2>
        <p className="mt-4 max-w-md opacity-70">{t.sub}</p>
        <a href="mailto:makers@mizbaz.ir" className="press mt-8 inline-flex rounded-full bg-accent px-6 py-3 font-semibold text-white shadow-[0_10px_30px_-8px_var(--accent)] hover:brightness-110">
          {t.cta}
        </a>
      </div>
    </Reveal>
  );
}
