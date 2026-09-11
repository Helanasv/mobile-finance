"use client";

import { useState } from "react";

import { useFinance } from "@/components/finance/finance-context";
import { CURRENCIES } from "@/lib/currency";
import { messages, type Locale } from "@/lib/i18n";
import type { Currency } from "@/lib/types";

export function LanguageScreen() {
  const { completeSetup } = useFinance();
  const [step, setStep] = useState<"language" | "currency">("language");
  const [locale, setLocale] = useState<Locale | null>(null);
  const t = messages[locale ?? "ru"];

  function pickCurrency(currency: Currency) {
    if (!locale) return;
    completeSetup(locale, currency);
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-1 pb-28 pt-2">
      <div className="text-center">
        <span className="mx-auto mb-3 flex size-11 items-center justify-center rounded-2xl border border-amber-200/20 bg-primary/15 font-display text-lg text-primary">
          Д
        </span>
        <p className="text-xs tracking-[0.2em] text-primary/80 uppercase">
          Достаток · Dostatok
        </p>
        {step === "language" ? (
          <>
            <h1 className="mt-2 font-display text-3xl font-medium tracking-tight">
              Выберите язык
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Choose language</p>
          </>
        ) : (
          <>
            <h1 className="mt-2 font-display text-3xl font-medium tracking-tight">
              {t.chooseCurrency}
            </h1>
            <p className="mt-2 text-sm font-medium text-primary">{t.tapCurrency}</p>
            <button
              type="button"
              onClick={() => setStep("language")}
              className="mt-3 text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              {t.back}
            </button>
          </>
        )}
      </div>

      {step === "language" ? (
        <div className="mt-6 grid gap-3">
          <button
            type="button"
            onClick={() => {
              setLocale("ru");
              setStep("currency");
            }}
            className="rounded-[1.6rem] border border-amber-200/15 bg-card px-5 py-5 text-left"
          >
            <span className="block font-display text-2xl">Русский</span>
            <span className="mt-1 block text-sm text-muted-foreground">
              Интерфейс на русском
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLocale("en");
              setStep("currency");
            }}
            className="rounded-[1.6rem] border border-amber-200/15 bg-card px-5 py-5 text-left"
          >
            <span className="block font-display text-2xl">English</span>
            <span className="mt-1 block text-sm text-muted-foreground">
              Use the app in English
            </span>
          </button>
        </div>
      ) : (
        <div className="mt-5 grid gap-2">
          {CURRENCIES.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => pickCurrency(item.code)}
              className="flex min-h-16 items-center justify-between rounded-[1.4rem] border border-amber-200/15 bg-card px-4 py-3 text-left active:border-primary/50 active:bg-primary/10"
            >
              <span>
                <span className="block font-display text-lg">{item.label[locale ?? "ru"]}</span>
                <span className="text-xs text-muted-foreground">{item.code}</span>
              </span>
              <span className="font-display text-2xl text-primary">{item.symbol}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
