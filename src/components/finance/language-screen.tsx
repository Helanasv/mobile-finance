"use client";

import { useFinance } from "@/components/finance/finance-context";
import type { Locale } from "@/lib/i18n";

export function LanguageScreen() {
  const { setLocale } = useFinance();

  function choose(locale: Locale) {
    setLocale(locale);
  }

  return (
    <div className="flex flex-1 flex-col justify-center gap-8 px-2 py-10">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Карман · Karman</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Выберите язык
        </h1>
        <p className="mt-1 text-lg text-muted-foreground">Choose language</p>
      </div>
      <div className="grid gap-3">
        <button
          type="button"
          onClick={() => choose("ru")}
          className="rounded-3xl border bg-card px-5 py-5 text-left transition hover:bg-muted/60"
        >
          <span className="block text-xl font-semibold">Русский</span>
          <span className="mt-1 block text-sm text-muted-foreground">
            Интерфейс на русском
          </span>
        </button>
        <button
          type="button"
          onClick={() => choose("en")}
          className="rounded-3xl border bg-card px-5 py-5 text-left transition hover:bg-muted/60"
        >
          <span className="block text-xl font-semibold">English</span>
          <span className="mt-1 block text-sm text-muted-foreground">
            Use the app in English
          </span>
        </button>
      </div>
    </div>
  );
}
