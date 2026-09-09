"use client";

import { useState } from "react";

import { useFinance } from "@/components/finance/finance-context";
import { CURRENCIES } from "@/lib/currency";
import { messages, type Locale } from "@/lib/i18n";
import type { Currency } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LanguageScreen() {
  const { completeSetup } = useFinance();
  const [step, setStep] = useState<"language" | "currency">("language");
  const [locale, setLocale] = useState<Locale | null>(null);
  const [currency, setCurrency] = useState<Currency>("RUB");
  const t = messages[locale ?? "ru"];

  return (
    <div className="flex flex-1 flex-col justify-center gap-8 px-1 py-10">
      <div className="text-center">
        <span className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-amber-200/20 bg-primary/15 font-display text-2xl text-primary">
          А
        </span>
        <p className="text-sm tracking-[0.2em] text-primary/80 uppercase">
          Ауреа · Aurea
        </p>
        {step === "language" ? (
          <>
            <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">
              Выберите язык
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">Choose language</p>
          </>
        ) : (
          <>
            <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">
              {t.chooseCurrency}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{t.currencyHint}</p>
          </>
        )}
      </div>

      {step === "language" ? (
        <div className="grid gap-3">
          <button
            type="button"
            onClick={() => {
              setLocale("ru");
              setStep("currency");
            }}
            className="rounded-[1.6rem] border border-amber-200/15 bg-card px-5 py-6 text-left transition hover:border-primary/40 hover:bg-accent"
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
            className="rounded-[1.6rem] border border-amber-200/15 bg-card px-5 py-6 text-left transition hover:border-primary/40 hover:bg-accent"
          >
            <span className="block font-display text-2xl">English</span>
            <span className="mt-1 block text-sm text-muted-foreground">
              Use the app in English
            </span>
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {CURRENCIES.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => setCurrency(item.code)}
              className={cn(
                "flex items-center justify-between rounded-[1.6rem] border px-5 py-5 text-left transition",
                currency === item.code
                  ? "border-primary/50 bg-primary/10"
                  : "border-amber-200/15 bg-card hover:border-primary/40 hover:bg-accent",
              )}
            >
              <span>
                <span className="block font-display text-xl">{item.label[locale ?? "ru"]}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{item.code}</span>
              </span>
              <span className="font-display text-2xl text-primary">{item.symbol}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => locale && completeSetup(locale, currency)}
            className="mt-2 h-12 rounded-2xl bg-primary text-base font-semibold text-primary-foreground"
          >
            {t.continue}
          </button>
          <button
            type="button"
            onClick={() => setStep("language")}
            className="text-sm text-muted-foreground"
          >
            {t.back}
          </button>
        </div>
      )}
    </div>
  );
}
