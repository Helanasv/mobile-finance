"use client";

import { useMemo, useState } from "react";

import { useEditTransaction } from "@/components/finance/app-shell";
import { useFinance } from "@/components/finance/finance-context";
import { TransactionRow } from "@/components/finance/transaction-row";
import { Input } from "@/components/ui/input";
import { categoryById, groupedTransactions } from "@/lib/finance";
import { formatDayHeading } from "@/lib/format";
import type { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";

const FILTERS: { id: "all" | TransactionType; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "expense", label: "Расходы" },
  { id: "income", label: "Доходы" },
];

export function HistoryScreen() {
  const { ready, state } = useFinance();
  const edit = useEditTransaction();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | TransactionType>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.transactions.filter((tx) => {
      if (filter !== "all" && tx.type !== filter) return false;
      if (!q) return true;
      const category = categoryById(state, tx.categoryId);
      return (
        category?.name.toLowerCase().includes(q) ||
        tx.note.toLowerCase().includes(q)
      );
    });
  }, [filter, query, state]);

  const groups = groupedTransactions(filtered);

  if (!ready) {
    return <div className="h-40 animate-pulse rounded-3xl bg-muted" />;
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <header>
        <p className="text-sm text-muted-foreground">Карман</p>
        <h1 className="text-2xl font-semibold tracking-tight">История</h1>
      </header>

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Категория или комментарий"
        className="h-11 rounded-2xl"
      />

      <div className="flex gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "h-8 rounded-full px-3 text-sm",
              filter === item.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed px-6 py-16 text-center">
          <p className="font-medium">Ничего не нашлось</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Измените фильтр или добавьте операцию плюсом внизу.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(([day, list]) => (
            <section key={day}>
              <h2 className="mb-1 px-1 text-sm font-medium text-muted-foreground">
                {formatDayHeading(day)}
              </h2>
              {list.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  transaction={tx}
                  category={categoryById(state, tx.categoryId)}
                  onClick={() => edit(tx)}
                />
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
