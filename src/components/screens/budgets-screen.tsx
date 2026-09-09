"use client";

import { useState } from "react";
import { toast } from "sonner";

import { CategoryIcon } from "@/components/finance/category-icon";
import { useFinance, useLocale, useT } from "@/components/finance/finance-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  categoryById,
  categorySpend,
  monthTotals,
  spentInCategory,
} from "@/lib/finance";
import { formatMoney, formatMonthTitle, monthKey, parseAmount } from "@/lib/format";
import { categoryLabel } from "@/lib/i18n";
import type { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BudgetsScreen() {
  const { ready, state, upsertBudget, setMonthLimit, addRecurring, deleteRecurring, resetDemo, clearAll } =
    useFinance();
  const t = useT();
  const locale = useLocale();
  const month = monthKey();
  const totals = monthTotals(state, month);
  const spend = categorySpend(state, month, "expense");
  const maxSpend = spend[0]?.amount ?? 0;
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [monthLimitDraft, setMonthLimitDraft] = useState(
    state.monthLimit ? String(state.monthLimit) : "",
  );
  const [recType, setRecType] = useState<TransactionType>("expense");
  const [recCategory, setRecCategory] = useState("home");
  const [recAmount, setRecAmount] = useState("");
  const [recNote, setRecNote] = useState("");
  const [recDay, setRecDay] = useState("1");

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

      <section className="space-y-3 rounded-[1.6rem] border border-amber-200/15 bg-card p-4">
        <h2 className="text-sm font-medium">{t.monthLimit}</h2>
        <p className="text-xs text-muted-foreground">{t.monthLimitHint}</p>
        {state.monthLimit > 0 ? (
          <>
            <p className="text-sm tabular-nums">
              {t.monthLimitOf(
                formatMoney(totals.expense, state.currency, locale),
                formatMoney(state.monthLimit, state.currency, locale),
              )}
            </p>
            <Progress
              className="h-1.5"
              value={Math.min(100, (totals.expense / state.monthLimit) * 100)}
            />
          </>
        ) : null}
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const raw = monthLimitDraft.trim();
            if (!raw) {
              setMonthLimit(0);
              toast.success(t.monthLimitSaved);
              return;
            }
            const value = parseAmount(raw);
            if (!Number.isFinite(value) || value < 0) {
              toast.error(t.enterLimit);
              return;
            }
            setMonthLimit(value);
            toast.success(t.monthLimitSaved);
          }}
        >
          <Input
            inputMode="decimal"
            placeholder={`${t.limitPlaceholder}, ${state.currency}`}
            className="h-10 rounded-xl"
            value={monthLimitDraft}
            onChange={(event) => setMonthLimitDraft(event.target.value)}
          />
          <Button type="submit" className="h-10 rounded-xl">
            {t.ok}
          </Button>
        </form>
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

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t.recurring}</h2>
        <p className="text-xs text-muted-foreground">{t.recurringHint}</p>
        {state.recurrings.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.recurringEmpty}</p>
        ) : (
          <ul className="space-y-2">
            {state.recurrings.map((item) => {
              const category = categoryById(state, item.categoryId);
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-3xl border p-4"
                >
                  <span
                    className="flex size-10 items-center justify-center rounded-2xl text-white"
                    style={{ backgroundColor: category?.color ?? "#94a3b8" }}
                  >
                    <CategoryIcon name={category?.icon ?? "repeat"} className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {category
                        ? categoryLabel(category.id, locale, category.name)
                        : item.categoryId}
                    </p>
                    <p className="text-sm tabular-nums text-muted-foreground">
                      {formatMoney(item.amount, state.currency, locale)} · {t.everyMonthOn(item.dayOfMonth)}
                    </p>
                    {item.note ? (
                      <p className="truncate text-xs text-muted-foreground">{item.note}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="text-sm text-destructive"
                    onClick={() => {
                      deleteRecurring(item.id);
                      toast.success(t.recurringDeleted);
                    }}
                  >
                    {t.delete}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <form
          className="space-y-2 rounded-3xl border p-4"
          onSubmit={(event) => {
            event.preventDefault();
            const value = parseAmount(recAmount);
            const day = Number(recDay);
            if (!Number.isFinite(value) || value <= 0) {
              toast.error(t.amountError);
              return;
            }
            if (!Number.isInteger(day) || day < 1 || day > 28) {
              toast.error(t.recurringDayError);
              return;
            }
            addRecurring({
              type: recType,
              categoryId: recCategory,
              amount: value,
              note: recNote.trim(),
              dayOfMonth: day,
            });
            setRecAmount("");
            setRecNote("");
            toast.success(t.recurringSaved);
          }}
        >
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
            <button
              type="button"
              className={cn(
                "h-9 rounded-xl text-sm font-medium",
                recType === "expense" ? "bg-background shadow-sm" : "text-muted-foreground",
              )}
              onClick={() => {
                setRecType("expense");
                const first = state.categories.find((category) => category.type === "expense");
                if (first) setRecCategory(first.id);
              }}
            >
              {t.expense}
            </button>
            <button
              type="button"
              className={cn(
                "h-9 rounded-xl text-sm font-medium",
                recType === "income" ? "bg-background shadow-sm" : "text-muted-foreground",
              )}
              onClick={() => {
                setRecType("income");
                const first = state.categories.find((category) => category.type === "income");
                if (first) setRecCategory(first.id);
              }}
            >
              {t.income}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {state.categories
              .filter((category) => category.type === recType)
              .map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setRecCategory(category.id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs",
                    recCategory === category.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {categoryLabel(category.id, locale, category.name)}
                </button>
              ))}
          </div>
          <Input
            inputMode="decimal"
            placeholder={`${t.amount}, ${state.currency}`}
            className="h-10 rounded-xl"
            value={recAmount}
            onChange={(event) => setRecAmount(event.target.value)}
          />
          <Input
            inputMode="numeric"
            placeholder={t.recurringDay}
            className="h-10 rounded-xl"
            value={recDay}
            onChange={(event) => setRecDay(event.target.value)}
          />
          <Input
            placeholder={t.noteOptional}
            className="h-10 rounded-xl"
            value={recNote}
            onChange={(event) => setRecNote(event.target.value)}
          />
          <Button type="submit" className="h-10 w-full rounded-xl">
            {t.addRecurring}
          </Button>
        </form>
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
