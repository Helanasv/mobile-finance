"use client";

import { Lightbulb, TrendingUp } from "lucide-react";
import { useMemo } from "react";

import { CategoryIcon } from "@/components/finance/category-icon";
import { useFinance, useLocale, useT } from "@/components/finance/finance-context";
import { Progress } from "@/components/ui/progress";
import {
  allTimeCategorySpend,
  allTimeInsights,
  allTimeTotals,
  categoryById,
  compareMonths,
  forecastNextMonth,
  monthlyBreakdown,
  transactionDateRange,
} from "@/lib/finance";
import { formatMoney, formatMonthTitle, formatShortDate, monthKey } from "@/lib/format";
import { categoryLabel } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function AnalysisScreen() {
  const { ready, state } = useFinance();
  const t = useT();
  const locale = useLocale();

  const totals = useMemo(() => allTimeTotals(state), [state]);
  const spend = useMemo(() => allTimeCategorySpend(state, "expense"), [state]);
  const range = useMemo(() => transactionDateRange(state), [state]);
  const months = useMemo(() => monthlyBreakdown(state).slice(-6), [state]);
  const forecast = useMemo(() => forecastNextMonth(state), [state]);
  const insights = useMemo(() => allTimeInsights(state), [state]);
  const comparison = useMemo(() => compareMonths(state, monthKey()), [state]);
  const leftover = totals.income - totals.expense;
  const maxSpend = spend[0]?.amount ?? 0;
  const maxMonth = Math.max(1, ...months.map((row) => Math.max(row.income, row.expense)));

  if (!ready) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <div className="h-10 w-40 animate-pulse rounded-full bg-muted" />
        <div className="h-48 animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      <header>
        <p className="text-xs font-medium tracking-[0.18em] text-primary/80 uppercase">
          {t.appName}
        </p>
        <h1 className="font-display text-3xl font-medium tracking-tight">{t.analysis}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.analysisAllTime}
          {range
            ? ` · ${t.analysisRange(formatShortDate(range.from, locale), formatShortDate(range.to, locale))}`
            : null}
        </p>
        {state.transactions.length > 0 ? (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t.analysisOps(state.transactions.length)}
          </p>
        ) : null}
      </header>

      {state.transactions.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed px-6 py-16 text-center">
          <p className="font-medium">{t.emptyTitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t.analysisEmpty}</p>
        </div>
      ) : (
        <>
          <section className="relative overflow-hidden rounded-[1.75rem] border border-amber-200/20 bg-[linear-gradient(145deg,#2a231c_0%,#1a1612_55%,#3a2f24_100%)] p-5 text-amber-50 shadow-[inset_0_1px_0_rgba(255,220,160,0.15)]">
            <div className="absolute top-0 left-0 h-full w-1.5 bg-primary" />
            <p className="pl-2 text-sm font-medium text-amber-100/70">{t.leftoverAll}</p>
            <p className="mt-3 pl-2 font-display text-[2.1rem] leading-none font-medium tracking-tight tabular-nums">
              {formatMoney(leftover, state.currency, locale)}
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
          </section>

          <section className="rounded-[1.6rem] border border-amber-200/15 bg-card p-4">
            <p className="text-sm font-medium">{t.compareTitle}</p>
            {!comparison.hasPrevious ? (
              <p className="mt-3 text-sm text-muted-foreground">{t.compareEmpty}</p>
            ) : (
              <>
                <p className="mt-2 text-sm text-muted-foreground">
                  {comparison.expenseDelta > 0
                    ? t.compareExpenseUp(
                        formatMoney(comparison.expenseDelta, state.currency, locale),
                      )
                    : comparison.expenseDelta < 0
                      ? t.compareExpenseDown(
                          formatMoney(Math.abs(comparison.expenseDelta), state.currency, locale),
                        )
                      : t.compareExpenseSame}
                </p>
                <ul className="mt-4 space-y-3">
                  {comparison.rows.slice(0, 6).map((row) => (
                    <li key={row.category.id} className="flex items-center gap-3">
                      <span
                        className="flex size-8 items-center justify-center rounded-xl text-white"
                        style={{ backgroundColor: row.category.color }}
                      >
                        <CategoryIcon name={row.category.icon} className="size-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-2 text-sm">
                          <span className="truncate">
                            {categoryLabel(row.category.id, locale, row.category.name)}
                          </span>
                          <span
                            className={cn(
                              "shrink-0 tabular-nums",
                              row.delta > 0 && "text-red-300",
                              row.delta < 0 && "text-primary",
                            )}
                          >
                            {row.delta > 0 ? "+" : row.delta < 0 ? "−" : ""}
                            {formatMoney(Math.abs(row.delta), state.currency, locale)}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {t.comparePrev} {formatMoney(row.previous, state.currency, locale)} → {t.compareNow}{" "}
                          {formatMoney(row.current, state.currency, locale)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <section className="rounded-[1.6rem] border border-amber-200/15 bg-card p-4">
            <p className="text-sm font-medium">{t.whereMoneyGoes}</p>
            {spend.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">{t.noSpend}</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {spend.map(({ category, amount }) => {
                  const pct = totals.expense > 0 ? Math.round((amount / totals.expense) * 100) : 0;
                  return (
                    <li key={category.id} className="flex items-center gap-3">
                      <span
                        className="flex size-8 items-center justify-center rounded-xl text-white"
                        style={{ backgroundColor: category.color }}
                      >
                        <CategoryIcon name={category.icon} className="size-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-2 text-sm">
                          <span className="truncate">
                            {categoryLabel(category.id, locale, category.name)}
                          </span>
                          <span className="shrink-0 tabular-nums text-muted-foreground">
                            {formatMoney(amount, state.currency, locale)}
                          </span>
                        </div>
                        <Progress
                          className="mt-1.5 h-1.5"
                          value={maxSpend > 0 ? (amount / maxSpend) * 100 : 0}
                        />
                        <p className="mt-1 text-[11px] text-muted-foreground">{t.shareOfSpend(pct)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {months.length > 0 ? (
            <section className="rounded-[1.6rem] border border-amber-200/15 bg-card p-4">
              <p className="text-sm font-medium">{t.byMonth}</p>
              <ul className="mt-4 space-y-3">
                {months.map((row) => (
                  <li key={row.month}>
                    <p className="mb-1 text-xs capitalize text-muted-foreground">
                      {formatMonthTitle(row.month, locale)}
                    </p>
                    <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                      <span
                        className="bg-primary/80"
                        style={{ width: `${(row.income / maxMonth) * 100}%` }}
                      />
                      <span
                        className="bg-amber-100/35"
                        style={{ width: `${(row.expense / maxMonth) * 100}%` }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between text-[11px] tabular-nums text-muted-foreground">
                      <span>
                        {t.income} {formatMoney(row.income, state.currency, locale)}
                      </span>
                      <span>
                        {t.expense} {formatMoney(row.expense, state.currency, locale)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {forecast ? (
            <section className="rounded-[1.6rem] border border-amber-200/15 bg-card p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{t.forecastTitle}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {formatMonthTitle(forecast.nextMonth, locale)}
                  </p>
                </div>
                <TrendingUp className="size-4 text-primary" />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <ForecastRow
                  label={t.forecastIncome}
                  value={formatMoney(forecast.avgIncome, state.currency, locale)}
                  tone="income"
                />
                <ForecastRow
                  label={t.forecastExpense}
                  value={formatMoney(forecast.avgExpense, state.currency, locale)}
                />
                <ForecastRow
                  label={t.forecastLeft}
                  value={formatMoney(forecast.leftover, state.currency, locale)}
                  tone={forecast.leftover >= 0 ? "income" : "warn"}
                />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {t.forecastHint(forecast.sampleSize)}
              </p>
            </section>
          ) : null}

          {insights.length > 0 ? (
            <section className="rounded-[1.6rem] border border-amber-200/15 bg-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb className="size-4 text-primary" />
                <p className="text-sm font-medium">{t.recommendations}</p>
              </div>
              <ul className="space-y-3">
                {insights.map((insight) => {
                  const category = insight.categoryId
                    ? categoryById(state, insight.categoryId)
                    : undefined;
                  const name = category
                    ? categoryLabel(category.id, locale, category.name)
                    : "";
                  const text =
                    insight.kind === "top" && insight.percent != null
                      ? t.recTop(name, insight.percent)
                      : insight.kind === "overspend"
                        ? t.recOverspend
                        : insight.kind === "ok"
                          ? t.recOk
                          : insight.kind === "save" && insight.amount != null
                            ? t.recSave(formatMoney(insight.amount, state.currency, locale))
                            : insight.kind === "needData"
                              ? t.recNeedData
                              : insight.kind === "tight"
                                ? t.recTight(name)
                                : null;
                  if (!text) return null;
                  return (
                    <li
                      key={insight.id}
                      className="rounded-2xl border border-amber-200/10 bg-muted/40 px-3 py-2.5 text-sm leading-relaxed"
                    >
                      {text}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}

function ForecastRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "income" | "warn";
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-amber-200/10 bg-muted/30 px-3 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-sm font-semibold tabular-nums",
          tone === "income" && "text-primary",
          tone === "warn" && "text-red-300",
        )}
      >
        {value}
      </span>
    </div>
  );
}
