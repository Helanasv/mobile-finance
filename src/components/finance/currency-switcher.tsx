"use client";

import { CURRENCIES } from "@/lib/currency";
import type { Currency } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CurrencySwitcher({
  value,
  onChange,
  variant = "muted",
}: {
  value: Currency;
  onChange: (currency: Currency) => void;
  variant?: "muted" | "on-gradient";
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-4 gap-1 rounded-2xl p-1",
        variant === "on-gradient" ? "bg-black/15" : "bg-muted",
      )}
      role="radiogroup"
      aria-label="Currency"
    >
      {CURRENCIES.map((item) => {
        const selected = value === item.code;
        return (
          <button
            key={item.code}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={item.label}
            onClick={() => onChange(item.code)}
            className={cn(
              "h-9 rounded-xl text-sm font-semibold transition",
              selected
                ? variant === "on-gradient"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background text-foreground shadow-sm"
                : variant === "on-gradient"
                  ? "text-amber-50/70"
                  : "text-muted-foreground",
            )}
          >
            {item.symbol}
          </button>
        );
      })}
    </div>
  );
}