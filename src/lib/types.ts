import type { Currency } from "@/lib/currency";
import type { Locale } from "@/lib/i18n";

export type { Currency, Locale };

export type TransactionType = "income" | "expense";

export type Category = {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
};

export type Transaction = {
  id: string;
  type: TransactionType;
  categoryId: string;
  amount: number;
  note: string;
  date: string;
};

export type Budget = {
  categoryId: string;
  limit: number;
};

export type FinanceState = {
  locale: Locale | null;
  currency: Currency;
  setupComplete: boolean;
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
};
