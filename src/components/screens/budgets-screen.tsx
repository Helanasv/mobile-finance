"use client";

import { useState } from "react";
import { toast } from "sonner";

import { CategoryIcon } from "@/components/finance/category-icon";
import { useFinance } from "@/components/finance/finance-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  categorySpend,
  monthTotals,
  spentInCategory,
} from "@/lib/finance";
import { formatMoney, formatMonthTitle, monthKey } from "@/lib/format";
import { cn } from "@/lib/utils";

export function BudgetsScreen() {
  const { ready, state, upsertBudget, resetDemo, clearAll } = useFinance();
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
        <p className="text-sm text-muted-foreground">Карман</p>
        <h1 className="text-2xl font-semibold tracking-tight">Бюджеты</h1>
        <p className="mt-1 text-sm capitalize text-muted-foreground">
          {formatMonthTitle(month)}
        </p>
      </header>

      <section className="rounded-3xl border p-4">
        <p className="text-sm text-muted-foreground">Расходы по категориям</p>
        {spend.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            В этом месяце ещё нет расходов.
          </p>
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
                    <span className="truncate">{category.name}</span>
                    <span className="tabular-nums">{formatMoney(amount)}</span>
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
          Всего потрачено {formatMoney(totals.expense)} из доходов{" "}
          {formatMoney(totals.income)}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Лимиты</h2>
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
                  <p className="font-medium">{category.name}</p>
                  <p className={cn("text-sm tabular-nums", over && "text-destructive")}>
                    {formatMoney(spent)}
                    {limit ? ` из ${formatMoney(limit)}` : " — лимит не задан"}
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
                    toast.error("Введите лимит");
                    return;
                  }
                  upsertBudget({ categoryId: category.id, limit: Math.round(value) });
                  toast.success(`Лимит для «${category.name}» обновлён`);
                }}
              >
                <Input
                  inputMode="numeric"
                  placeholder="Лимит, ₽"
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
                  Ок
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
            toast.success("Загружен демо-месяц");
          }}
        >
          Вернуть демо-данные
        </Button>
        <Button
          variant="ghost"
          className="h-11 w-full rounded-2xl text-destructive"
          onClick={() => {
            clearAll();
            toast.success("Все операции удалены");
          }}
        >
          Очистить всё
        </Button>
      </section>
    </div>
  );
}
