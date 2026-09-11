import { inMonth, isoDateInMonth, monthKey, shiftMonth, todayIso } from "@/lib/format";
import { categoryLabel } from "@/lib/i18n";
import type { Category, FinanceState, Goal, Transaction, TransactionType } from "@/lib/types";

export function monthTotals(state: FinanceState, month: string) {
  return (state.transactions ?? []).reduce(
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
  return (state.transactions ?? []).reduce((sum, tx) => {
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

export function allTimeTotals(state: FinanceState) {
  return (state.transactions ?? []).reduce(
    (acc, tx) => {
      if (tx.type === "income") acc.income += tx.amount;
      else acc.expense += tx.amount;
      return acc;
    },
    { income: 0, expense: 0 },
  );
}

export function allTimeCategorySpend(state: FinanceState, type: TransactionType) {
  const totals = new Map<string, number>();
  for (const tx of state.transactions) {
    if (tx.type !== type) continue;
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

export function transactionDateRange(state: FinanceState) {
  if (state.transactions.length === 0) return null;
  const dates = state.transactions.map((tx) => tx.date).sort();
  return { from: dates[0], to: dates[dates.length - 1] };
}

export function monthlyBreakdown(state: FinanceState) {
  const map = new Map<string, { income: number; expense: number }>();
  for (const tx of state.transactions) {
    const key = tx.date.slice(0, 7);
    const row = map.get(key) ?? { income: 0, expense: 0 };
    if (tx.type === "income") row.income += tx.amount;
    else row.expense += tx.amount;
    map.set(key, row);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, totals]) => ({ month, ...totals }));
}

export function forecastNextMonth(state: FinanceState) {
  const months = monthlyBreakdown(state);
  if (months.length === 0) return null;
  const sample = months.slice(-3);
  const avgIncome = sample.reduce((sum, row) => sum + row.income, 0) / sample.length;
  const avgExpense = sample.reduce((sum, row) => sum + row.expense, 0) / sample.length;
  return {
    avgIncome,
    avgExpense,
    leftover: avgIncome - avgExpense,
    sampleSize: sample.length,
    nextMonth: shiftMonth(monthKey(), 1),
  };
}

export type Insight = {
  id: string;
  kind: "top" | "overspend" | "save" | "ok" | "needData" | "tight";
  categoryId?: string;
  percent?: number;
  amount?: number;
};

export function allTimeInsights(state: FinanceState): Insight[] {
  const totals = allTimeTotals(state);
  const spend = allTimeCategorySpend(state, "expense");
  const months = monthlyBreakdown(state);
  const insights: Insight[] = [];
  const top = spend[0];
  const currentMonth = monthKey();

  if (state.transactions.length < 4 || months.length < 2) {
    insights.push({ id: "need-data", kind: "needData" });
  }

  if (top && totals.expense > 0) {
    insights.push({
      id: "top",
      kind: "top",
      categoryId: top.category.id,
      percent: Math.round((top.amount / totals.expense) * 100),
      amount: top.amount,
    });
  }

  if (totals.expense > totals.income && totals.expense > 0) {
    insights.push({ id: "overspend", kind: "overspend" });
  } else if (totals.income > 0 && totals.expense > 0 && totals.income >= totals.expense) {
    insights.push({
      id: "ok",
      kind: "ok",
      amount: totals.income - totals.expense,
    });
  }

  const forecast = forecastNextMonth(state);
  if (forecast && forecast.leftover > 0 && months.length >= 2) {
    insights.push({
      id: "save",
      kind: "save",
      amount: forecast.leftover,
    });
  }

  const tight = state.budgets
    .map((budget) => {
      const spent = spentInCategory(state, budget.categoryId, currentMonth);
      const ratio = budget.limit > 0 ? spent / budget.limit : 0;
      return { categoryId: budget.categoryId, ratio };
    })
    .filter((row) => row.ratio >= 0.8)
    .sort((a, b) => b.ratio - a.ratio)[0];

  if (tight) {
    insights.push({ id: "tight", kind: "tight", categoryId: tight.categoryId });
  }

  return insights.slice(0, 4);
}

export function withDueRecurring(state: FinanceState, today = todayIso()): FinanceState {
  const month = today.slice(0, 7);
  const extra: Transaction[] = [];

  for (const rec of state.recurrings) {
    const date = isoDateInMonth(month, rec.dayOfMonth);
    if (date > today) continue;
    const already = state.transactions.some(
      (tx) => tx.recurringId === rec.id && tx.date.startsWith(month),
    );
    if (already) continue;
    extra.push({
      id: crypto.randomUUID(),
      type: rec.type,
      categoryId: rec.categoryId,
      amount: rec.amount,
      note: rec.note,
      date,
      recurringId: rec.id,
    });
  }

  if (extra.length === 0) return state;
  return { ...state, transactions: [...extra, ...state.transactions] };
}

export function monthsToGoal(goal: Goal, monthlyLeftover: number) {
  const need = goal.target - goal.saved;
  if (need <= 0) return 0;
  if (monthlyLeftover <= 0) return null;
  return Math.ceil(need / monthlyLeftover);
}

export function compareMonths(state: FinanceState, current: string) {
  const prev = shiftMonth(current, -1);
  const now = monthTotals(state, current);
  const before = monthTotals(state, prev);
  const nowSpend = categorySpend(state, current, "expense");
  const prevSpend = categorySpend(state, prev, "expense");
  const prevMap = new Map(prevSpend.map((row) => [row.category.id, row.amount]));
  const seen = new Set<string>();
  const rows: {
    category: Category;
    current: number;
    previous: number;
    delta: number;
  }[] = [];

  for (const row of nowSpend) {
    seen.add(row.category.id);
    const previous = prevMap.get(row.category.id) ?? 0;
    rows.push({
      category: row.category,
      current: row.amount,
      previous,
      delta: row.amount - previous,
    });
  }

  for (const row of prevSpend) {
    if (seen.has(row.category.id)) continue;
    rows.push({
      category: row.category,
      current: 0,
      previous: row.amount,
      delta: -row.amount,
    });
  }

  rows.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  return {
    current,
    prev,
    now,
    before,
    expenseDelta: now.expense - before.expense,
    incomeDelta: now.income - before.income,
    rows,
    hasPrevious: state.transactions.some((tx) => inMonth(tx.date, prev)),
  };
}

export function transactionsToCsv(state: FinanceState, locale: "ru" | "en") {
  const header = ["date", "type", "category", "amount", "note"];
  const lines = [header.join(",")];
  const sorted = [...state.transactions].sort((a, b) => a.date.localeCompare(b.date));
  for (const tx of sorted) {
    const category = categoryById(state, tx.categoryId);
    const name = category ? categoryLabel(category.id, locale, category.name) : tx.categoryId;
    const cells = [
      tx.date,
      tx.type,
      csvCell(name),
      String(tx.amount),
      csvCell(tx.note),
    ];
    lines.push(cells.join(","));
  }
  return `\uFEFF${lines.join("\n")}`;
}

function csvCell(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}
