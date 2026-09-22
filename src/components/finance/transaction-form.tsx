"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useFinance, useLocale, useT } from "@/components/finance/finance-context";
import { CategoryIcon } from "@/components/finance/category-icon";
import { currencyMeta } from "@/lib/currency";
import { formatMoney, todayIso } from "@/lib/format";
import { todayPace } from "@/lib/finance";
import { categoryLabel } from "@/lib/i18n";
import type { SpendIntent, Transaction, TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Transaction | null;
  fromTodayNorm?: boolean;
};

export function TransactionForm({ open, onOpenChange, initial, fromTodayNorm }: Props) {
  const { state, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const t = useT();
  const locale = useLocale();
  const defaultType = initial?.type ?? "expense";
  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId ??
      state.categories.find((category) => category.type === defaultType)?.id ??
      "",
  );
  const [note, setNote] = useState(initial?.note ?? "");
  const [date, setDate] = useState(initial?.date ?? todayIso());
  const [intent, setIntent] = useState<SpendIntent>(initial?.intent ?? "need");

  const categories = useMemo(
    () => state.categories.filter((category) => category.type === type),
    [state.categories, type],
  );

  function resetForType(next: TransactionType) {
    setType(next);
    const first = state.categories.find((category) => category.type === next);
    setCategoryId(first?.id ?? "");
    if (next === "expense") setIntent("need");
  }

  function handleOpen(next: boolean) {
    if (next) {
      const nextType = initial?.type ?? "expense";
      setType(nextType);
      setAmount(initial ? String(initial.amount) : "");
      setCategoryId(
        initial?.categoryId ??
          state.categories.find((category) => category.type === nextType)?.id ??
          "",
      );
      setNote(initial?.note ?? "");
      setDate(initial?.date ?? todayIso());
      setIntent(initial?.intent ?? "need");
    }
    onOpenChange(next);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const value = Number(amount.replace(",", ".").replace(/\s/g, ""));
    if (!Number.isFinite(value) || value <= 0) {
      toast.error(t.amountError);
      return;
    }
    if (!categoryId) {
      toast.error(t.categoryError);
      return;
    }

    const payload: Omit<Transaction, "id"> = {
      type,
      categoryId,
      amount: Math.round(value * 100) / 100,
      note: note.trim(),
      date,
      ...(type === "expense" ? { intent } : {}),
    };

    const pace = todayPace(state);
    const hitsToday = type === "expense" && date === todayIso();

    if (initial) {
      updateTransaction({ ...payload, id: initial.id, recurringId: initial.recurringId });
      toast.success(t.txUpdated);
    } else {
      addTransaction(payload);
      if (hitsToday && pace.planned > 0 && payload.amount > pace.left) {
        toast.success(t.ateTomorrow);
      } else {
        toast.success(
          type === "income"
            ? t.incomeSaved
            : hitsToday && pace.planned > 0
              ? t.stillInToday
              : t.expenseSaved,
        );
      }
      setAmount("");
      setNote("");
      setDate(todayIso());
      setIntent("need");
    }
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[92svh] w-full max-w-md overflow-y-auto rounded-t-3xl border-x px-5 pb-8"
      >
        <SheetHeader className="px-0 text-left">
          <SheetTitle>
            {initial ? t.editTx : fromTodayNorm ? t.spendFromToday : t.newTx}
          </SheetTitle>
          <SheetDescription>
            {fromTodayNorm && !initial && todayPace(state).planned > 0
              ? t.todayNormLeft(formatMoney(Math.max(todayPace(state).left, 0), state.currency, locale))
              : t.txStoredLocal}
          </SheetDescription>
        </SheetHeader>

        <form className="flex flex-col gap-5" onSubmit={submit}>
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
            <button
              type="button"
              className={cn(
                "h-10 rounded-xl text-sm font-medium transition",
                type === "expense"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
              onClick={() => resetForType("expense")}
            >
              {t.expense}
            </button>
            <button
              type="button"
              className={cn(
                "h-10 rounded-xl text-sm font-medium transition",
                type === "income"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
              onClick={() => resetForType("income")}
            >
              {t.income}
            </button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              {t.amount}, {currencyMeta(state.currency).symbol}
            </Label>
            <Input
              id="amount"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="h-14 rounded-2xl text-2xl font-semibold tracking-tight"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>{t.category}</Label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setCategoryId(category.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-2xl border px-1 py-2.5 text-[11px] leading-tight",
                    categoryId === category.id
                      ? "border-primary bg-primary/10"
                      : "border-transparent bg-muted/70",
                  )}
                >
                  <span
                    className="flex size-9 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    <CategoryIcon name={category.icon} className="size-4" />
                  </span>
                  {categoryLabel(category.id, locale, category.name)}
                </button>
              ))}
            </div>
          </div>

          {type === "expense" ? (
            <div className="space-y-2">
              <Label>{t.intentHint}</Label>
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
                <button
                  type="button"
                  className={cn(
                    "h-10 rounded-xl text-sm font-medium",
                    intent === "need" ? "bg-background shadow-sm" : "text-muted-foreground",
                  )}
                  onClick={() => setIntent("need")}
                >
                  {t.intentNeed}
                </button>
                <button
                  type="button"
                  className={cn(
                    "h-10 rounded-xl text-sm font-medium",
                    intent === "want" ? "bg-background shadow-sm" : "text-muted-foreground",
                  )}
                  onClick={() => setIntent("want")}
                >
                  {t.intentWant}
                </button>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">{t.date}</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">{t.note}</Label>
              <Input
                id="note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={t.noteOptional}
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {initial ? (
              <Button
                type="button"
                variant="destructive"
                size="lg"
                className="h-12 flex-1 rounded-2xl"
                onClick={() => {
                  deleteTransaction(initial.id);
                  toast.success(t.txDeleted);
                  onOpenChange(false);
                }}
              >
                {t.delete}
              </Button>
            ) : null}
            <Button type="submit" size="lg" className="h-12 flex-1 rounded-2xl">
              {initial ? t.save : t.add}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
