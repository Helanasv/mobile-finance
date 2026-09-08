"use client";

import { useFinance } from "@/components/finance/finance-context";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { state, setLocale } = useFinance();
  const current = state.locale ?? "ru";

  return (
    <div className="grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1" role="radiogroup" aria-label="Language">
      {(["ru", "en"] as Locale[]).map((locale) => (
        <button
          key={locale}
          type="button"
          role="radio"
          aria-checked={current === locale}
          onClick={() => setLocale(locale)}
          className={cn(
            "h-9 rounded-xl text-sm font-semibold transition",
            current === locale
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground",
          )}
        >
          {locale === "ru" ? "Русский" : "English"}
        </button>
      ))}
    </div>
  );
}
