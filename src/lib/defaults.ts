import type { Budget, Category, FinanceState, Transaction } from "@/lib/types";
import { todayIso } from "@/lib/format";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "salary", name: "Зарплата", type: "income", icon: "wallet", color: "#34d399" },
  { id: "freelance", name: "Подработка", type: "income", icon: "briefcase", color: "#6ee7b7" },
  { id: "transfer", name: "Перевод", type: "income", icon: "arrow-down-left", color: "#a7f3d0" },
  { id: "other-in", name: "Прочее", type: "income", icon: "plus-circle", color: "#86efac" },
  { id: "food", name: "Продукты", type: "expense", icon: "shopping-cart", color: "#fb7185" },
  { id: "cafe", name: "Кафе", type: "expense", icon: "coffee", color: "#fbbf24" },
  { id: "transport", name: "Транспорт", type: "expense", icon: "bus", color: "#38bdf8" },
  { id: "home", name: "Жильё", type: "expense", icon: "home", color: "#c4b5fd" },
  { id: "health", name: "Здоровье", type: "expense", icon: "heart-pulse", color: "#f472b6" },
  { id: "shop", name: "Покупки", type: "expense", icon: "shopping-bag", color: "#818cf8" },
  { id: "subs", name: "Подписки", type: "expense", icon: "repeat", color: "#22d3ee" },
  { id: "fun", name: "Развлечения", type: "expense", icon: "clapperboard", color: "#f97316" },
  { id: "other-out", name: "Прочее", type: "expense", icon: "more-horizontal", color: "#94a3b8" },
];

function monthDay(day: number) {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const clamped = Math.min(Math.max(1, day), Math.min(now.getDate(), lastDay));
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(clamped).padStart(2, "0"),
  ].join("-");
}

export function createSeedTransactions(): Transaction[] {
  const today = todayIso();
  return [
    {
      id: "t1",
      type: "income",
      categoryId: "salary",
      amount: 128000,
      note: "Аванс и оклад",
      date: monthDay(1),
    },
    {
      id: "t2",
      type: "expense",
      categoryId: "home",
      amount: 42000,
      note: "Аренда квартиры",
      date: monthDay(1),
    },
    {
      id: "t3",
      type: "expense",
      categoryId: "food",
      amount: 4680,
      note: "Перекрёсток",
      date: monthDay(2),
    },
    {
      id: "t4",
      type: "expense",
      categoryId: "cafe",
      amount: 740,
      note: "Кофе и круассан",
      date: today,
    },
    {
      id: "t5",
      type: "expense",
      categoryId: "transport",
      amount: 2300,
      note: "Тройка на месяц",
      date: monthDay(1),
    },
    {
      id: "t6",
      type: "expense",
      categoryId: "subs",
      amount: 399,
      note: "Музыка",
      date: monthDay(2),
    },
    {
      id: "t7",
      type: "expense",
      categoryId: "shop",
      amount: 3190,
      note: "Кроссовки со скидкой",
      date: monthDay(2),
    },
    {
      id: "t8",
      type: "income",
      categoryId: "freelance",
      amount: 18000,
      note: "Правки лендинга",
      date: monthDay(2),
    },
    {
      id: "t9",
      type: "expense",
      categoryId: "fun",
      amount: 1200,
      note: "Кино",
      date: monthDay(1),
    },
    {
      id: "t10",
      type: "expense",
      categoryId: "health",
      amount: 2100,
      note: "Аптека",
      date: monthDay(1),
    },
  ];
}

export const DEFAULT_BUDGETS: Budget[] = [
  { categoryId: "food", limit: 18000 },
  { categoryId: "cafe", limit: 6000 },
  { categoryId: "transport", limit: 4000 },
  { categoryId: "shop", limit: 8000 },
  { categoryId: "fun", limit: 5000 },
];

export function createInitialState(): FinanceState {
  return {
    locale: null,
    currency: "RUB",
    setupComplete: false,
    categories: DEFAULT_CATEGORIES,
    transactions: createSeedTransactions(),
    budgets: DEFAULT_BUDGETS,
  };
}
