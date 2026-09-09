"use client";

import { useMemo, useState } from "react";

import { useEditTransaction } from "@/components/finance/app-shell";
import { useFinance, useLocale, useT } from "@/components/finance/finance-context";
import { TransactionRow } from "@/components/finance/transaction-row";
import { Input } from "@/components/ui/input";
import { categoryById, groupedTransactions } from "@/lib/finance";
import { formatDayHeading } from "@/lib/format";
import { categoryLabel } from "@/lib/i18n";
import type { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function HistoryScreen() {
  const { ready, state } = useFinance();
  const t = useT();
  const locale = useLocale();
  const edit = useEditTransaction();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | TransactionType>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.transactions.filter((tx) => {
      if (filter !== "all" && tx.type !== filter) return false;
      if (!q) return true;
      const category = categoryById(state, tx.categoryId);
      const labels = [
        category?.name,
        category ? categoryLabel(category.id, "ru") : "",
        category ? categoryLabel(category.id, "en") : "",
        tx.note,
      ]
        .join(" ")
        .toLowerCase();
      return labels.includes(q);
    });
  }, [filter, query, state]);

  const groups = groupedTransactions(filtered);

  if (!ready) {
    return <div className="h-40 animate-pulse rounded-3xl bg-muted" />;
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <header>
        <p className="text-xs font-medium tracking-[0.18em] text-primary/80 uppercase">
          {t.appName}
        </p>
        <h1 className="font-display text-3xl font-medium tracking-tight">{t.history}</h1>
      </header>

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t.searchPlaceholder}
        className="h-11 rounded-2xl"
      />

      <div className="flex gap-2">
        {(
          [
            { id: "all" as const, label: t.filterAll },
            { id: "expense" as const, label: t.expense },
            { id: "income" as const, label: t.income },
          ]
        ).map((item) => (
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
          <p className="font-medium">{t.nothingFound}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t.nothingHint}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(([day, list]) => (
            <section key={day}>
              <h2 className="mb-1 px-1 text-sm font-medium text-muted-foreground">
                {formatDayHeading(day, locale)}
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
