"use client";

import { useState } from "react";
import { toast } from "sonner";

import { CategoryIcon } from "@/components/finance/category-icon";
import { CurrencySwitcher } from "@/components/finance/currency-switcher";
import { LanguageSwitcher } from "@/components/finance/language-switcher";
import { useFinance, useLocale, useT } from "@/components/finance/finance-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  categorySpend,
  monthTotals,
  spentInCategory,
} from "@/lib/finance";
import { formatMoney, formatMonthTitle, monthKey } from "@/lib/format";
import { categoryLabel } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function BudgetsScreen() {
  const { ready, state, upsertBudget, setCurrency, resetDemo, clearAll } = useFinance();
  const t = useT();
  const locale = useLocale();
  const month = monthKey();
  const totals = monthTotals(state, month);
  const spend = categorySpend(state, month, "expense");
  const maxSpend = spend[0]?.amount ?? 0;
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const budgetRows = state.categories
    .filter((category) => category.type === "expense")
    .map((category) => {
      const budget = state.budgets.find((item) => item.categoryId === category.id);
      const spent = spentInCategory(state, category.id, month);
      return { category, budget, spent };
    });

  if (!ready) {
    return <div className="h-40 animate-pulse rounded-3xl bg-muted" />;
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      <header>
        <p className="text-xs font-medium tracking-[0.18em] text-primary/80 uppercase">
          {t.appName}
        </p>
        <h1 className="font-display text-3xl font-medium tracking-tight">{t.budgets}</h1>
        <p className="mt-1 text-sm capitalize text-muted-foreground">
          {formatMonthTitle(month, locale)}
        </p>
      </header>

      <section className="space-y-2">
        <p className="text-sm font-medium">{t.language}</p>
        <LanguageSwitcher />
      </section>

      <section className="space-y-2">
        <p className="text-sm font-medium">{t.currency}</p>
        <CurrencySwitcher value={state.currency} onChange={setCurrency} />
        <p className="text-xs text-muted-foreground">{t.currencyHint}</p>
      </section>

      <section className="rounded-3xl border p-4">
        <p className="text-sm text-muted-foreground">{t.spendByCategory}</p>
        {spend.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{t.noSpend}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {spend.map(({ category, amount }) => (
              <li key={category.id} className="flex items-center gap-3">
                <span
                  className="flex size-8 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: category.color }}
                >
                  <CategoryIcon name={category.icon} className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="truncate">
                      {categoryLabel(category.id, locale, category.name)}
                    </span>
                    <span className="tabular-nums">{formatMoney(amount, state.currency, locale)}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${maxSpend ? (amount / maxSpend) * 100 : 0}%`,
                        backgroundColor: category.color,
                      }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-sm text-muted-foreground">
          {t.spentOfIncome(
            formatMoney(totals.expense, state.currency, locale),
            formatMoney(totals.income, state.currency, locale),
          )}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t.limits}</h2>
        {budgetRows.map(({ category, budget, spent }) => {
          const limit = budget?.limit ?? 0;
          const ratio = limit > 0 ? spent / limit : 0;
          const over = limit > 0 && spent > limit;
          return (
            <div key={category.id} className="rounded-3xl border p-4">
              <div className="flex items-center gap-3">
                <span
                  className="flex size-10 items-center justify-center rounded-2xl text-white"
                  style={{ backgroundColor: category.color }}
                >
                  <CategoryIcon name={category.icon} className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {categoryLabel(category.id, locale, category.name)}
                  </p>
                  <p className={cn("text-sm tabular-nums", over && "text-destructive")}>
                    {formatMoney(spent, state.currency, locale)}
                    {limit
                      ? ` ${t.of} ${formatMoney(limit, state.currency, locale)}`
                      : t.noLimit}
                  </p>
                </div>
              </div>
              {limit > 0 ? (
                <Progress
                  className="mt-3 h-1.5"
                  value={Math.min(100, ratio * 100)}
                />
              ) : null}
              <form
                className="mt-3 flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const raw = drafts[category.id] ?? String(limit || "");
                  const value = Number(raw.replace(",", ".").replace(/\s/g, ""));
                  if (!Number.isFinite(value) || value < 0) {
                    toast.error(t.enterLimit);
                    return;
                  }
                  upsertBudget({
                    categoryId: category.id,
                    limit: Math.round(value * 100) / 100,
                  });
                  toast.success(
                    t.limitUpdated(categoryLabel(category.id, locale, category.name)),
                  );
                }}
              >
                <Input
                  inputMode="numeric"
                  placeholder={`${t.limitPlaceholder}, ${state.currency}`}
                  className="h-10 rounded-xl"
                  value={drafts[category.id] ?? (limit ? String(limit) : "")}
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [category.id]: event.target.value,
                    }))
                  }
                />
                <Button type="submit" className="h-10 rounded-xl">
                  {t.ok}
                </Button>
              </form>
            </div>
          );
        })}
      </section>

      <section className="mt-auto space-y-2 pb-2">
        <Button
          variant="outline"
          className="h-11 w-full rounded-2xl"
          onClick={() => {
            resetDemo();
            toast.success(t.demoLoaded);
          }}
        >
          {t.restoreDemo}
        </Button>
        <Button
          variant="ghost"
          className="h-11 w-full rounded-2xl text-destructive"
          onClick={() => {
            clearAll();
            toast.success(t.cleared);
          }}
        >
          {t.clearAll}
        </Button>
      </section>
    </div>
  );
}
