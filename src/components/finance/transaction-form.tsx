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
import { useFinance } from "@/components/finance/finance-context";
import { CategoryIcon } from "@/components/finance/category-icon";
import { currencyMeta } from "@/lib/currency";
import { todayIso } from "@/lib/format";
import type { Transaction, TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Transaction | null;
};

export function TransactionForm({ open, onOpenChange, initial }: Props) {
  const { state, addTransaction, updateTransaction, deleteTransaction } = useFinance();
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

  const categories = useMemo(
    () => state.categories.filter((category) => category.type === type),
    [state.categories, type],
  );

  function resetForType(next: TransactionType) {
    setType(next);
    const first = state.categories.find((category) => category.type === next);
    setCategoryId(first?.id ?? "");
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
    }
    onOpenChange(next);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const value = Number(amount.replace(",", ".").replace(/\s/g, ""));
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Укажите сумму больше нуля");
      return;
    }
    if (!categoryId) {
      toast.error("Выберите категорию");
      return;
    }

    const payload = {
      type,
      categoryId,
      amount: Math.round(value * 100) / 100,
      note: note.trim(),
      date,
    };

    if (initial) {
      updateTransaction({ ...payload, id: initial.id });
      toast.success("Операция обновлена");
    } else {
      addTransaction(payload);
      toast.success(type === "income" ? "Доход записан" : "Расход записан");
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
          <SheetTitle>{initial ? "Изменить операцию" : "Новая операция"}</SheetTitle>
          <SheetDescription>
            Сумма хранится только на этом телефоне, в браузере.
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
              Расход
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
              Доход
            </button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Сумма, {currencyMeta(state.currency).symbol}</Label>
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
            <Label>Категория</Label>
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
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Дата</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Комментарий</Label>
              <Input
                id="note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Необязательно"
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
                  toast.success("Операция удалена");
                  onOpenChange(false);
                }}
              >
                Удалить
              </Button>
            ) : null}
            <Button type="submit" size="lg" className="h-12 flex-1 rounded-2xl">
              {initial ? "Сохранить" : "Добавить"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
