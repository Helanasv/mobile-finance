"use client";

import { CategoryIcon } from "@/components/finance/category-icon";
import { formatSignedMoney } from "@/lib/format";
import type { Category, Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TransactionRow({
  transaction,
  category,
  onClick,
}: {
  transaction: Transaction;
  category?: Category;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl px-1 py-2.5 text-left transition hover:bg-muted/60"
    >
      <span
        className="flex size-11 shrink-0 items-center justify-center rounded-2xl text-white"
        style={{ backgroundColor: category?.color ?? "#64748b" }}
      >
        <CategoryIcon name={category?.icon ?? "more-horizontal"} className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">
          {category?.name ?? "Категория"}
        </span>
        <span className="block truncate text-sm text-muted-foreground">
          {transaction.note || "Без комментария"}
        </span>
      </span>
      <span
        className={cn(
          "shrink-0 text-sm font-semibold tabular-nums",
          transaction.type === "income" ? "text-emerald-400" : "text-foreground",
        )}
      >
        {formatSignedMoney(transaction.amount, transaction.type)}
      </span>
    </button>
  );
}
