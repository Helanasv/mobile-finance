"use client";

import { useState } from "react";
import Link from "next/link";

import { useFinance, useLocale, useT } from "@/components/finance/finance-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CURRENCIES } from "@/lib/currency";
import type { Locale } from "@/lib/i18n";

export function SettingsScreen() {
  const { state, setLocale, setCurrency, setDisplayName } = useFinance();
  const t = useT();
  const locale = useLocale();
  const [name, setName] = useState(state.displayName);
  const [saved, setSaved] = useState(false);

  function saveName() {
    setDisplayName(name);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="space-y-5 pb-6">
      <div>
        <Link
          href="/"
          className="text-xs font-medium text-muted-foreground no-underline"
        >
          ← {t.home}
        </Link>
        <h1 className="font-display mt-2 text-3xl font-medium tracking-tight">
          {t.settings}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.settingsHint}</p>
      </div>

      <section className="rounded-[1.6rem] border border-amber-200/15 bg-[#2a231c] p-5 text-[#f6e7c8]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c4a574]">
          {t.yourName}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-[#d8c9b4]/80">{t.nameHint}</p>
        <div className="mt-4 space-y-2">
          <Label htmlFor="display-name" className="text-[#d8c9b4]">
            {t.yourName}
          </Label>
          <Input
            id="display-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.namePlaceholder}
            className="h-11 border-[#3d342c] bg-[#1c1814] text-[#f6e7c8]"
            autoComplete="given-name"
          />
        </div>
        <Button
          type="button"
          className="mt-4 h-11 w-full bg-[#c4a574] text-[#1a1612] hover:bg-[#d4b584]"
          onClick={saveName}
        >
          {saved ? t.nameSaved : t.save}
        </Button>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold">{t.language}</h2>
          <p className="text-sm text-muted-foreground">{t.languageHint}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { id: "ru" as Locale, label: "Русский" },
              { id: "en" as Locale, label: "English" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setLocale(opt.id)}
              className={`min-h-12 rounded-2xl border px-4 text-sm font-medium ${
                locale === opt.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold">{t.currency}</h2>
          <p className="text-sm text-muted-foreground">{t.currencyHint}</p>
        </div>
        <div className="space-y-2">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => setCurrency(c.code)}
              className={`flex min-h-14 w-full items-center justify-between rounded-2xl border px-4 text-left ${
                state.currency === c.code
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card"
              }`}
            >
              <span className="text-sm font-medium">{c.label[locale]}</span>
              <span className="text-lg font-semibold">{c.symbol}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
