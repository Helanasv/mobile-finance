import { addDaysIso, daysBetween, inMonth, isoDateInMonth, isoWeekKey, isoWeekRange, monthKey, shiftMonth, thisFridayIso, todayIso } from "@/lib/format";
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
  return (state.categories ?? []).find((category) => category.id === id);
}

export function spentInCategory(state: FinanceState, categoryId: string, month: string) {
  return (state.transactions ?? [])
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

  return insights.slice(0, 4);
}

export function withDueRecurring(state: FinanceState, today = todayIso()): FinanceState {
  const month = today.slice(0, 7);
  const extra: Transaction[] = [];

  for (const rec of state.recurrings ?? []) {
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
  const header = ["date", "type", "category", "amount", "note", "intent"];
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
      tx.intent ?? "",
    ];
    lines.push(cells.join(","));
  }
  return `\uFEFF${lines.join("\n")}`;
}

function csvCell(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

export function clampPaydayDay(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 28
    ? value
    : 1;
}

export function lastPaydayIso(today: string, paydayDay: number) {
  const day = clampPaydayDay(paydayDay);
  const thisPay = isoDateInMonth(today.slice(0, 7), day);
  if (today >= thisPay) return thisPay;
  return isoDateInMonth(shiftMonth(today.slice(0, 7), -1), day);
}

export function nextPaydayIso(today: string, paydayDay: number) {
  const day = clampPaydayDay(paydayDay);
  const thisPay = isoDateInMonth(today.slice(0, 7), day);
  if (today < thisPay) return thisPay;
  return isoDateInMonth(shiftMonth(today.slice(0, 7), 1), day);
}

function monthKeysUntil(fromIso: string, toIso: string) {
  const keys: string[] = [];
  let key = fromIso.slice(0, 7);
  const end = toIso.slice(0, 7);
  while (key <= end) {
    keys.push(key);
    key = shiftMonth(key, 1);
  }
  return keys;
}

function upcomingRecurring(state: FinanceState, today: string, nextPayday: string) {
  let expense = 0;
  let income = 0;
  const months = monthKeysUntil(today, nextPayday);
  for (const rec of state.recurrings ?? []) {
    for (const month of months) {
      const date = isoDateInMonth(month, rec.dayOfMonth);
      if (date <= today || date >= nextPayday) continue;
      const already = (state.transactions ?? []).some(
        (tx) => tx.recurringId === rec.id && tx.date === date,
      );
      if (already) continue;
      if (rec.type === "expense") expense += rec.amount;
      else income += rec.amount;
    }
  }
  return { expense, income };
}

export function reservedInGoals(state: FinanceState) {
  return (state.goals ?? []).reduce((sum, goal) => sum + goal.saved, 0);
}

export type SpendableUntilPayday = {
  lastPayday: string;
  nextPayday: string;
  daysLeft: number;
  reservedGoals: number;
  upcomingExpense: number;
  upcomingIncome: number;
  spendable: number;
  perDay: number | null;
};

export function spendableUntilPayday(
  state: FinanceState,
  today = todayIso(),
): SpendableUntilPayday {
  const paydayDay = clampPaydayDay(state.paydayDay);
  const lastPayday = lastPaydayIso(today, paydayDay);
  const nextPayday = nextPaydayIso(today, paydayDay);
  const daysLeft = Math.max(0, daysBetween(today, nextPayday));
  const reservedGoals = reservedInGoals(state);
  const upcoming = upcomingRecurring(state, today, nextPayday);
  const raw =
    overallBalance(state) - reservedGoals - upcoming.expense + upcoming.income;
  const spendable = Math.round(raw * 100) / 100;
  return {
    lastPayday,
    nextPayday,
    daysLeft,
    reservedGoals,
    upcomingExpense: upcoming.expense,
    upcomingIncome: upcoming.income,
    spendable,
    perDay: daysLeft > 0 ? Math.round((spendable / daysLeft) * 100) / 100 : null,
  };
}

export function averageDailySpend(state: FinanceState, today = todayIso()) {
  const from = addDaysIso(today, -29);
  const expenses = (state.transactions ?? []).filter(
    (tx) => tx.type === "expense" && tx.date >= from && tx.date <= today,
  );
  if (expenses.length === 0) return null;
  const sum = expenses.reduce((total, tx) => total + tx.amount, 0);
  const earliest = expenses.reduce((min, tx) => (tx.date < min ? tx.date : min), today);
  const span = Math.max(1, daysBetween(earliest, today) + 1);
  return Math.round((sum / span) * 100) / 100;
}

export function cushionGoal(state: FinanceState) {
  const goals = state.goals ?? [];
  if (goals.length === 0) return null;
  const named = goals.find((goal) =>
    /запас|подушк|reserve|cushion|emergency/i.test(goal.name),
  );
  return named ?? goals[0];
}

export function daysOfHabit(saved: number, dailySpend: number | null) {
  if (dailySpend == null || dailySpend <= 0 || saved <= 0) return null;
  const days = Math.floor(saved / dailySpend);
  return Math.min(days, 999);
}

export type CushionView = {
  goal: Goal | null;
  saved: number;
  dailySpend: number | null;
  days: number | null;
};

export function cushionDays(state: FinanceState, today = todayIso()): CushionView {
  const goal = cushionGoal(state);
  const dailySpend = averageDailySpend(state, today);
  const saved = goal?.saved ?? 0;
  return {
    goal,
    saved,
    dailySpend,
    days: daysOfHabit(saved, dailySpend),
  };
}

export function todayExpense(state: FinanceState, today = todayIso()) {
  return (state.transactions ?? [])
    .filter((tx) => tx.type === "expense" && tx.date === today)
    .reduce((sum, tx) => sum + tx.amount, 0);
}

export function averageCategoryDaily(
  state: FinanceState,
  categoryId: string,
  today = todayIso(),
) {
  const from = addDaysIso(today, -29);
  const expenses = (state.transactions ?? []).filter(
    (tx) =>
      tx.type === "expense" &&
      tx.categoryId === categoryId &&
      tx.date >= from &&
      tx.date <= today,
  );
  if (expenses.length === 0) return 0;
  const sum = expenses.reduce((total, tx) => total + tx.amount, 0);
  const earliest = expenses.reduce((min, tx) => (tx.date < min ? tx.date : min), today);
  const span = Math.max(1, daysBetween(earliest, today) + 1);
  return Math.round((sum / span) * 100) / 100;
}

export function typicalSubscriptionAmount(state: FinanceState) {
  const subs = (state.transactions ?? [])
    .filter((tx) => tx.type === "expense" && tx.categoryId === "subs")
    .sort((a, b) => b.date.localeCompare(a.date));
  if (subs.length === 0) return 399;
  return subs[0].amount;
}

export type WhatIfInput = {
  skipCafe: boolean;
  extraBill: number;
  extraSave: number;
};

export type WhatIfPreview = {
  spendable: number;
  perDay: number | null;
  daysLeft: number;
  cushionDays: number | null;
  cafeKept: number;
  extraBill: number;
  extraSave: number;
};

export function whatIfPreview(
  state: FinanceState,
  input: WhatIfInput,
  today = todayIso(),
): WhatIfPreview {
  const base = spendableUntilPayday(state, today);
  const cushion = cushionDays(state, today);
  const cafeDaily = averageCategoryDaily(state, "cafe", today);
  const cafeKept =
    input.skipCafe && cafeDaily > 0
      ? Math.round(cafeDaily * Math.max(base.daysLeft, 1) * 100) / 100
      : 0;

  let spendable = base.spendable + cafeKept - input.extraBill - input.extraSave;
  spendable = Math.round(spendable * 100) / 100;

  let dailyHabit = cushion.dailySpend;
  if (input.skipCafe && dailyHabit != null && cafeDaily > 0) {
    dailyHabit = Math.max(Math.round((dailyHabit - cafeDaily) * 100) / 100, 1);
  }

  const saved = cushion.saved + input.extraSave;
  const perDay =
    base.daysLeft > 0 ? Math.round((spendable / base.daysLeft) * 100) / 100 : spendable;

  return {
    spendable,
    perDay,
    daysLeft: base.daysLeft,
    cushionDays: daysOfHabit(saved, dailyHabit),
    cafeKept,
    extraBill: input.extraBill,
    extraSave: input.extraSave,
  };
}

export function expenseBetween(state: FinanceState, from: string, to: string) {
  return (state.transactions ?? []).filter(
    (tx) => tx.type === "expense" && tx.date >= from && tx.date <= to,
  );
}

export function todayPace(state: FinanceState, today = todayIso()) {
  const free = spendableUntilPayday(state, today);
  const spent = todayExpense(state, today);
  const planned = free.perDay != null && free.perDay > 0 ? free.perDay : 0;
  const left = Math.round((planned - spent) * 100) / 100;
  return { planned, spent, left, over: planned > 0 && spent > planned };
}

export function untilFriday(state: FinanceState, today = todayIso()) {
  const friday = thisFridayIso(today);
  const days = Math.max(1, daysBetween(today, friday) + 1);
  const free = spendableUntilPayday(state, today);
  const raw = free.perDay != null && free.perDay > 0 ? free.perDay * days : 0;
  const amount = Math.round(Math.min(Math.max(raw, 0), Math.max(free.spendable, 0)) * 100) / 100;
  return { friday, days, amount };
}

export function wantNeedTotals(state: FinanceState) {
  const expenses = (state.transactions ?? []).filter((tx) => tx.type === "expense");
  let want = 0;
  let need = 0;
  let other = 0;
  for (const tx of expenses) {
    if (tx.intent === "want") want += tx.amount;
    else if (tx.intent === "need") need += tx.amount;
    else other += tx.amount;
  }
  const tagged = want + need;
  return {
    want,
    need,
    other,
    tagged,
    wantShare: tagged > 0 ? Math.round((want / tagged) * 100) : null,
  };
}

export function reserveScenes(state: FinanceState, today = todayIso()) {
  const cushion = cushionDays(state, today);
  const rent =
    (state.recurrings ?? []).find((item) => item.type === "expense" && item.categoryId === "home")
      ?.amount ?? 0;
  const foodDaily =
    averageCategoryDaily(state, "food", today) + averageCategoryDaily(state, "cafe", today);
  const foodWeek = Math.round(foodDaily * 7 * 100) / 100;
  return {
    saved: cushion.saved,
    days: cushion.days,
    rent,
    rentMonths: rent > 0 && cushion.saved > 0 ? Math.floor(cushion.saved / rent) : null,
    foodWeek,
    foodWeeks: foodWeek > 0 && cushion.saved > 0 ? Math.floor(cushion.saved / foodWeek) : null,
  };
}

export function weekCompare(state: FinanceState, today = todayIso()) {
  const thisWeek = isoWeekRange(today);
  const lastWeek = isoWeekRange(addDaysIso(thisWeek.from, -1));
  const now = expenseBetween(state, thisWeek.from, thisWeek.to);
  const prev = expenseBetween(state, lastWeek.from, lastWeek.to);
  const sum = (list: typeof now) => list.reduce((total, tx) => total + tx.amount, 0);
  const cafe = (list: typeof now) =>
    list.filter((tx) => tx.categoryId === "cafe").reduce((total, tx) => total + tx.amount, 0);
  const want = (list: typeof now) =>
    list.filter((tx) => tx.intent === "want").reduce((total, tx) => total + tx.amount, 0);
  const nowTotal = sum(now);
  const prevTotal = sum(prev);
  const tagged = now.filter((tx) => tx.intent);
  const taggedSum = sum(tagged);
  return {
    weekKey: isoWeekKey(today),
    nowTotal,
    prevTotal,
    cafeNow: cafe(now),
    cafePrev: cafe(prev),
    wantShare: taggedSum > 0 ? Math.round((want(now) / taggedSum) * 100) : null,
    hasPrev: prev.length > 0,
  };
}
