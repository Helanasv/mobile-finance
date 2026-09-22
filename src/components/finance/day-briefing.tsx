"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useFinance, useLocale, useT } from "@/components/finance/finance-context";
import { Button } from "@/components/ui/button";
import {
  cushionDays,
  spendableUntilPayday,
  todayExpense,
} from "@/lib/finance";
import { formatMoney, todayIso } from "@/lib/format";

function saveSuggestions(spendable: number) {
  const raw = [500, 1000, 3000, Math.round(spendable * 0.1)];
  const unique = [...new Set(raw.filter((value) => value >= 100 && value <= spendable))];
  return unique.slice(0, 4);
}

export function DayBriefing() {
  const { state, dismissBriefing, restoreBriefing, addToCushion } = useFinance();
  const t = useT();
  const locale = useLocale();
  const [saving, setSaving] = useState(false);
  const today = todayIso();
  const free = useMemo(() => spendableUntilPayday(state), [state]);
  const cushion = useMemo(() => cushionDays(state), [state]);
  const spentToday = useMemo(() => todayExpense(state), [state]);
  const hidden = state.briefingDismissedOn === today;

  if (hidden) {
    return (
      <section className="rounded-[1.6rem] border border-dashed border-amber-200/20 px-4 py-3">
        <p className="text-sm text-muted-foreground">{t.briefingHidden}</p>
        <button
          type="button"
          className="mt-1 text-sm text-primary"
          onClick={restoreBriefing}
        >
          {t.briefingShow}
        </button>
      </section>
    );
  }

  const suggestions = saveSuggestions(Math.max(0, free.spendable));

  return (
    <section className="rounded-[1.6rem] border border-amber-200/20 bg-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
        {t.dayBriefing}
      </p>
      <div className="mt-3 space-y-2 text-sm leading-relaxed">
        <p>
          {spentToday > 0
            ? t.dayBriefingToday(formatMoney(spentToday, state.currency, locale))
            : t.dayBriefingTodayNone}
        </p>
        <p>{t.dayBriefingPayday(t.daysLabel(free.daysLeft))}</p>
        <p>
          {cushion.days != null
            ? t.dayBriefingCushion(t.cushionDaysLine(cushion.days))
            : t.dayBriefingCushionNone}
        </p>
        <p>
          {free.perDay != null && free.perDay > 0
            ? t.dayBriefingTomorrow(formatMoney(free.perDay, state.currency, locale))
            : t.dayBriefingTomorrowNone}
        </p>
      </div>

      {saving ? (
        <div className="mt-4 space-y-2">
          <p className="text-xs text-muted-foreground">{t.briefingSaveHint}</p>
          {suggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.briefingNoFree}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl"
                  onClick={() => {
                    addToCushion(amount);
                    setSaving(false);
                    toast.success(t.briefingSaved);
                  }}
                >
                  {formatMoney(amount, state.currency, locale)}
                </Button>
              ))}
            </div>
          )}
          <button
            type="button"
            className="text-sm text-muted-foreground"
            onClick={() => setSaving(false)}
          >
            {t.back}
          </button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl"
            onClick={dismissBriefing}
          >
            {t.briefingGotIt}
          </Button>
          <Button
            type="button"
            className="h-11 rounded-xl"
            onClick={() => setSaving(true)}
          >
            {t.briefingSave}
          </Button>
        </div>
      )}
    </section>
  );
}
