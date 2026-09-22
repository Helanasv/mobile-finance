"use client";

import { ChartColumn, ChevronLeft, ChevronRight, PiggyBank, Settings } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { DayBriefing } from "@/components/finance/day-briefing";
import { WhatIfCard } from "@/components/finance/what-if";
import { useEditTransaction } from "@/components/finance/app-shell";
import { useFinance, useLocale, useT } from "@/components/finance/finance-context";
import { TransactionRow } from "@/components/finance/transaction-row";
import { Button } from "@/components/ui/button";
import {
  categoryById,
  cushionDays,
  groupedTransactions,
  monthTotals,
  overallBalance,
  spendableUntilPayday,
} from "@/lib/finance";
import {
  formatDayHeading,
  formatMoney,
  formatMonthTitle,
  formatShortDate,
  inMonth,
  monthKey,
  shiftMonth,
} from "@/lib/format";

export function HomeScreen() {
  const { ready, state } = useFinance();
  const t = useT();
  const locale = useLocale();
  const edit = useEditTransaction();
  const [month, setMonth] = useState(monthKey());

  const totals = useMemo(() => monthTotals(state, month), [state, month]);
  const balance = useMemo(() => overallBalance(state), [state]);
  const goals = state.goals ?? [];
  const leftover = totals.income - totals.expense;
  const monthTransactions = useMemo(
    () => (state.transactions ?? []).filter((tx) => inMonth(tx.date, month)),
    [state.transactions, month],
  );
  const recentGroups = groupedTransactions(monthTransactions).slice(0, 4);
  const displayName = state.displayName?.trim() ?? "";
  const free = useMemo(() => spendableUntilPayday(state), [state]);
  const cushion = useMemo(() => cushionDays(state), [state]);
  const committed = free.reservedGoals + free.upcomingExpense;

  if (!ready) {
    return <ScreenSkeleton />;
  }

  return (
    <div className="flex flex-col gap-5 pb-6">
      <header className="flex shrink-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
            {t.appName}
          </p>
          <h1 className="font-display text-3xl leading-tight font-medium tracking-tight">
            {displayName ? t.hello(displayName) : t.helloDefault}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Link
            href="/settings"
            className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground"
            aria-label={t.settings}
          >
            <Settings className="size-4" />
          </Link>
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
        </div>
      </header>

      <DayBriefing />

      <section className="relative shrink-0 rounded-[1.75rem] border border-amber-200/25 bg-[#2a231c] p-5 text-[#f6e7c8]">
        <div className="absolute top-0 left-0 h-full w-1.5 rounded-l-[1.75rem] bg-primary" />
        <div className="flex items-start justify-between gap-3 pl-2">
          <p className="text-sm font-medium text-[#f6e7c8]/80">{t.balance}</p>
          <p className="text-sm font-medium text-[#f6e7c8]/80">{state.currency}</p>
        </div>
        <p className="mt-4 pl-2 font-display text-[2.35rem] leading-tight font-medium tracking-tight tabular-nums text-[#f6e7c8]">
          {formatMoney(balance, state.currency, locale)}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 pl-2 text-sm">
          <div className="rounded-2xl border border-amber-100/15 bg-black/30 p-3">
            <p className="text-[#f6e7c8]/70">{t.income}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-primary">
              {formatMoney(totals.income, state.currency, locale)}
            </p>
          </div>
          <div className="rounded-2xl border border-amber-100/15 bg-black/30 p-3">
            <p className="text-[#f6e7c8]/70">{t.expense}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-[#f6e7c8]">
              {formatMoney(totals.expense, state.currency, locale)}
            </p>
          </div>
        </div>
        <p className="mt-4 pl-2 text-sm text-[#f6e7c8]/90">
          {t.leftover}{" "}
          <span className="font-semibold tabular-nums text-primary">
            {formatMoney(leftover, state.currency, locale)}
          </span>
        </p>
      </section>

      <section className="rounded-[1.6rem] border border-amber-200/20 bg-card p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          {t.freeUntilPayday}
        </p>
        {free.spendable > 0 ? (
          <>
            <p className="font-display mt-2 text-[2rem] leading-tight font-medium tracking-tight tabular-nums">
              {formatMoney(free.spendable, state.currency, locale)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.freeUntilHint(formatShortDate(free.nextPayday, locale), t.daysLabel(free.daysLeft))}
            </p>
            {free.perDay != null && free.perDay > 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {t.freePerDay(formatMoney(free.perDay, state.currency, locale))}
              </p>
            ) : null}
            {committed > 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                {t.freeCommitted(formatMoney(committed, state.currency, locale))}
              </p>
            ) : null}
          </>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.freeNone}</p>
        )}
        <Link href="/settings" className="mt-3 inline-block text-sm text-primary">
          {t.freeChangePayday}
        </Link>
      </section>

      <WhatIfCard />

      <Link
        href="/goals"
        className="flex shrink-0 items-center gap-3 rounded-[1.6rem] border border-amber-200/20 bg-card px-4 py-4"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <PiggyBank className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl font-medium tracking-tight">{t.goals}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {cushion.days != null
              ? t.cushionDaysLine(cushion.days)
              : goals[0]
                ? `${goals[0].name} · ${formatMoney(goals[0].saved, state.currency, locale)} / ${formatMoney(goals[0].target, state.currency, locale)}`
                : t.goalsHint}
          </p>
          {cushion.days != null && cushion.goal ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {cushion.goal.name} · {formatMoney(cushion.saved, state.currency, locale)}
            </p>
          ) : null}
        </div>
      </Link>

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

      <section className="flex flex-col">
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
