import { inMonth } from "@/lib/format";
import type { Category, FinanceState, Transaction, TransactionType } from "@/lib/types";

export function monthTotals(state: FinanceState, month: string) {
  return state.transactions.reduce(
    (acc, tx) => {
      if (!inMonth(tx.date, month)) return acc;
      if (tx.type === "income") acc.income += tx.amount;
      else acc.expense += tx.amount;
      return acc;
    },
    { income: 0, expense: 0 },
  );
}

export function overallBalance(state: FinanceState) {
  return state.transactions.reduce((sum, tx) => {
    return tx.type === "income" ? sum + tx.amount : sum - tx.amount;
  }, 0);
}

export function categoryById(state: FinanceState, id: string) {
  return state.categories.find((category) => category.id === id);
}

export function spentInCategory(state: FinanceState, categoryId: string, month: string) {
  return state.transactions
    .filter(
      (tx) =>
        tx.type === "expense" &&
        tx.categoryId === categoryId &&
        inMonth(tx.date, month),
    )
    .reduce((sum, tx) => sum + tx.amount, 0);
}

export function groupedTransactions(transactions: Transaction[]) {
  const groups = new Map<string, Transaction[]>();
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  for (const tx of sorted) {
    const list = groups.get(tx.date) ?? [];
    list.push(tx);
    groups.set(tx.date, list);
  }

  return [...groups.entries()];
}

export function categorySpend(state: FinanceState, month: string, type: TransactionType) {
  const totals = new Map<string, number>();
  for (const tx of state.transactions) {
    if (tx.type !== type || !inMonth(tx.date, month)) continue;
    totals.set(tx.categoryId, (totals.get(tx.categoryId) ?? 0) + tx.amount);
  }

  return [...totals.entries()]
    .map(([categoryId, amount]) => ({
      category: categoryById(state, categoryId),
      amount,
    }))
    .filter((row): row is { category: Category; amount: number } => Boolean(row.category))
    .sort((a, b) => b.amount - a.amount);
}
