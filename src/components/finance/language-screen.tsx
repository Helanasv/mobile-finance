"use client";

import { useFinance } from "@/components/finance/finance-context";
import type { Locale } from "@/lib/i18n";

export function LanguageScreen() {
  const { setLocale } = useFinance();

  function choose(locale: Locale) {
    setLocale(locale);
  }

  return (
    <div className="flex flex-1 flex-col justify-center gap-10 px-1 py-10">
      <div className="text-center">
        <span className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-amber-200/20 bg-primary/15 font-display text-2xl text-primary">
          К
        </span>
        <p className="text-sm tracking-[0.2em] text-primary/80 uppercase">
          Карман · Karman
        </p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">
          Выберите язык
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">Choose language</p>
      </div>
      <div className="grid gap-3">
        <button
          type="button"
          onClick={() => choose("ru")}
          className="rounded-[1.6rem] border border-amber-200/15 bg-card px-5 py-6 text-left transition hover:border-primary/40 hover:bg-accent"
        >
          <span className="block font-display text-2xl">Русский</span>
          <span className="mt-1 block text-sm text-muted-foreground">
            Интерфейс на русском
          </span>
        </button>
        <button
          type="button"
          onClick={() => choose("en")}
          className="rounded-[1.6rem] border border-amber-200/15 bg-card px-5 py-6 text-left transition hover:border-primary/40 hover:bg-accent"
        >
          <span className="block font-display text-2xl">English</span>
          <span className="mt-1 block text-sm text-muted-foreground">
            Use the app in English
          </span>
        </button>
      </div>
    </div>
  );
}
