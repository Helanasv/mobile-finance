"use client";

import { useMemo } from "react";

import { useFinance, useLocale, useT } from "@/components/finance/finance-context";
import { cushionDays, weekCompare } from "@/lib/finance";
import { formatMoney, isoWeekKey, todayIso } from "@/lib/format";

export function WeeklyNote() {
  const { state, dismissWeeklyNote, restoreWeeklyNote } = useFinance();
  const t = useT();
  const locale = useLocale();
  const week = useMemo(() => weekCompare(state), [state]);
  const cushion = useMemo(() => cushionDays(state), [state]);
  const name = state.displayName?.trim() ?? "";
  const hidden = state.weeklyNoteDismissedWeek === isoWeekKey(todayIso());

  if (hidden) {
    return (
      <section className="rounded-[1.6rem] border border-dashed border-amber-200/20 px-4 py-3">
        <p className="text-sm text-muted-foreground">{t.weekLetterHidden}</p>
        <button type="button" className="mt-1 text-sm text-primary" onClick={restoreWeeklyNote}>
          {t.weekLetterShow}
        </button>
      </section>
    );
  }

  const delta = Math.round((week.nowTotal - week.prevTotal) * 100) / 100;

  return (
    <section className="rounded-[1.6rem] border border-amber-200/20 bg-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
        {t.weekLetter}
      </p>
      <div className="mt-3 space-y-2 text-sm leading-relaxed">
        <p>{name ? t.weekLetterHello(name) : t.weekLetterHelloDefault}</p>
        {week.hasPrev ? (
          <p>
            {delta < -1
              ? t.weekLetterSpendDown(formatMoney(Math.abs(delta), state.currency, locale))
              : delta > 1
                ? t.weekLetterSpendUp(formatMoney(delta, state.currency, locale))
                : t.weekLetterSpendSame}
          </p>
        ) : (
          <p>{t.weekLetterNeedData}</p>
        )}
        {week.hasPrev && week.cafePrev + week.cafeNow > 0 && week.cafeNow !== week.cafePrev ? (
          <p>{week.cafeNow < week.cafePrev ? t.weekLetterCafeDown : t.weekLetterCafeUp}</p>
        ) : null}
        {week.wantShare != null ? <p>{t.weekLetterWant(week.wantShare)}</p> : null}
        {cushion.days != null ? (
          <p>{t.weekLetterReserve(t.cushionDaysLine(cushion.days))}</p>
        ) : null}
      </div>
      <button
        type="button"
        className="mt-4 text-sm text-primary"
        onClick={dismissWeeklyNote}
      >
        {t.weekLetterGotIt}
      </button>
    </section>
  );
}
