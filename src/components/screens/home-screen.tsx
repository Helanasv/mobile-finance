"use client";

import { ChartColumn, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useEditTransaction } from "@/components/finance/app-shell";
import { CategoryIcon } from "@/components/finance/category-icon";
import { CurrencySwitcher } from "@/components/finance/currency-switcher";
import { useFinance, useLocale, useT } from "@/components/finance/finance-context";
import { TransactionRow } from "@/components/finance/transaction-row";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  categoryById,
  groupedTransactions,
  monthTotals,
  overallBalance,
  spentInCategory,
} from "@/lib/finance";
import {
  formatDayHeading,
  formatMoney,
  formatMonthTitle,
  inMonth,
  monthKey,
  shiftMonth,
} from "@/lib/format";
import { categoryLabel } from "@/lib/i18n";

export function HomeScreen() {
  const { ready, state, setCurrency } = useFinance();
  const t = useT();
  const locale = useLocale();
  const edit = useEditTransaction();
  const [month, setMonth] = useState(monthKey());

  const totals = useMemo(() => monthTotals(state, month), [state, month]);
  const balance = useMemo(() => overallBalance(state), [state]);
  const leftover = totals.income - totals.expense;
  const monthTransactions = useMemo(
    () => state.transactions.filter((tx) => inMonth(tx.date, month)),
    [state.transactions, month],
  );
  const recentGroups = groupedTransactions(monthTransactions).slice(0, 4);
  const tightBudget = state.budgets
    .map((budget) => {
      const spent = spentInCategory(state, budget.categoryId, month);
      const category = categoryById(state, budget.categoryId);
      const ratio = budget.limit > 0 ? spent / budget.limit : 0;
      return { budget, spent, category, ratio };
    })
    .filter((item) => item.category)
    .sort((a, b) => b.ratio - a.ratio)[0];

  if (!ready) {
    return <ScreenSkeleton />;
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-primary/80 uppercase">
            {t.appName}
          </p>
          <h1 className="font-display text-3xl font-medium tracking-tight">{t.balance}</h1>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-muted px-1">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => setMonth(shiftMonth(month, -1))}
            aria-label={t.prevMonth}
          >
            <ChevronLeft />
          </Button>
          <span className="min-w-[7.5rem] text-center text-sm capitalize">
            {formatMonthTitle(month, locale)}
          </span>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => setMonth(shiftMonth(month, 1))}
            aria-label={t.nextMonth}
          >
            <ChevronRight />
          </Button>
        </div>
      </header>

      <section className="relative overflow-hidden rounded-[1.75rem] border border-amber-200/20 bg-[linear-gradient(145deg,#2a231c_0%,#1a1612_55%,#3a2f24_100%)] p-5 text-amber-50 shadow-[inset_0_1px_0_rgba(255,220,160,0.15)]">
        <div className="absolute top-0 left-0 h-full w-1.5 bg-primary" />
        <div className="flex items-start justify-between gap-3 pl-2">
          <p className="text-sm font-medium text-amber-100/70">{t.allAccounts}</p>
          <div className="w-[11.5rem]">
            <CurrencySwitcher
              value={state.currency}
              onChange={setCurrency}
              variant="on-gradient"
            />
          </div>
        </div>
        <p className="mt-4 pl-2 font-display text-[2.35rem] leading-none font-medium tracking-tight tabular-nums">
          {formatMoney(balance, state.currency, locale)}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 pl-2 text-sm">
          <div className="rounded-2xl border border-amber-100/10 bg-black/25 p-3">
            <p className="text-amber-100/60">{t.income}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-primary">
              {formatMoney(totals.income, state.currency, locale)}
            </p>
          </div>
          <div className="rounded-2xl border border-amber-100/10 bg-black/25 p-3">
            <p className="text-amber-100/60">{t.expense}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {formatMoney(totals.expense, state.currency, locale)}
            </p>
          </div>
        </div>
        <p className="mt-4 pl-2 text-sm text-amber-100/80">
          {t.leftover}{" "}
          <span className="font-semibold tabular-nums text-primary">
            {formatMoney(leftover, state.currency, locale)}
          </span>
        </p>
      </section>

      <Link
        href="/analysis"
        className="flex items-center justify-between gap-3 rounded-[1.6rem] border border-amber-200/15 bg-card px-4 py-3.5"
      >
        <div>
          <p className="text-sm font-medium">{t.openAnalysis}</p>
          <p className="text-xs text-muted-foreground">{t.analysisAllTime}</p>
        </div>
        <ChartColumn className="size-5 text-primary" />
      </Link>

      {tightBudget?.category ? (
        <section className="rounded-[1.6rem] border border-amber-200/15 bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium">{t.tightLimit}</p>
            <Sparkles className="size-4 text-primary" />
          </div>
          <div className="flex items-center gap-3">
            <span
              className="flex size-10 items-center justify-center rounded-2xl text-white"
              style={{ backgroundColor: tightBudget.category.color }}
            >
              <CategoryIcon name={tightBudget.category.icon} className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex justify-between text-sm">
                <span>{categoryLabel(tightBudget.category.id, locale, tightBudget.category.name)}</span>
                <span className="tabular-nums text-muted-foreground">
                  {formatMoney(tightBudget.spent, state.currency, locale)} / {formatMoney(tightBudget.budget.limit, state.currency, locale)}
                </span>
              </div>
              <Progress
                className="mt-2 h-1.5"
                value={Math.min(100, tightBudget.ratio * 100)}
              />
            </div>
          </div>
        </section>
      ) : null}

      <section className="flex flex-1 flex-col">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t.monthOps}</h2>
        </div>
        {recentGroups.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed px-6 py-12 text-center">
            <p className="font-medium">{t.emptyTitle}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.emptyHint}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {recentGroups.map(([day, list]) => (
              <div key={day}>
                <p className="mb-1 px-1 text-sm font-medium text-muted-foreground">
                  {formatDayHeading(day, locale)}
                </p>
                {list.map((tx) => (
                  <TransactionRow
                    key={tx.id}
                    transaction={tx}
                    category={categoryById(state, tx.categoryId)}
                    onClick={() => edit(tx)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ScreenSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="h-10 w-40 animate-pulse rounded-full bg-muted" />
      <div className="h-48 animate-pulse rounded-3xl bg-muted" />
      <div className="h-24 animate-pulse rounded-3xl bg-muted" />
    </div>
  );
}
