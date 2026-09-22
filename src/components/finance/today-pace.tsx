"use client";

import { useMemo } from "react";

import { useAddTransaction } from "@/components/finance/app-shell";
import { useFinance, useLocale, useT } from "@/components/finance/finance-context";
import { Button } from "@/components/ui/button";
import { todayPace } from "@/lib/finance";
import { formatMoney } from "@/lib/format";

export function TodayPaceCard() {
  const { state } = useFinance();
  const t = useT();
  const locale = useLocale();
  const add = useAddTransaction();
  const pace = useMemo(() => todayPace(state), [state]);

  return (
    <section className="rounded-[1.6rem] border border-amber-200/20 bg-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
        {t.todayNorm}
      </p>
      {pace.planned > 0 ? (
        <>
          <p className="font-display mt-2 text-[1.7rem] leading-tight font-medium tabular-nums">
            {formatMoney(Math.max(pace.left, 0), state.currency, locale)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {pace.over
              ? t.todayNormOver(formatMoney(pace.spent - pace.planned, state.currency, locale))
              : t.todayNormLeft(formatMoney(Math.max(pace.left, 0), state.currency, locale))}
          </p>
          <Button
            type="button"
            className="mt-3 h-11 w-full rounded-xl"
            onClick={() => add({ fromTodayNorm: true })}
          >
            {t.spendFromToday}
          </Button>
        </>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">{t.todayNormEmpty}</p>
      )}
    </section>
  );
}
