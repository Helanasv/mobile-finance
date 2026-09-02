"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

import { createInitialState } from "@/lib/defaults";
import {
  getFinanceSnapshot,
  getServerFinanceSnapshot,
  setFinanceState,
  subscribeFinance,
} from "@/lib/store";
import type { Budget, Currency, FinanceState, Transaction } from "@/lib/types";

type FinanceContextValue = {
  ready: boolean;
  state: FinanceState;
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  upsertBudget: (budget: Budget) => void;
  setCurrency: (currency: Currency) => void;
  resetDemo: () => void;
  clearAll: () => void;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

const emptySubscribe = () => () => {};

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const ready = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const state = useSyncExternalStore(
    subscribeFinance,
    getFinanceSnapshot,
    getServerFinanceSnapshot,
  );

  const addTransaction = useCallback((tx: Omit<Transaction, "id">) => {
    setFinanceState((current) => ({
      ...current,
      transactions: [{ ...tx, id: crypto.randomUUID() }, ...current.transactions],
    }));
  }, []);

  const updateTransaction = useCallback((tx: Transaction) => {
    setFinanceState((current) => ({
      ...current,
      transactions: current.transactions.map((item) => (item.id === tx.id ? tx : item)),
    }));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setFinanceState((current) => ({
      ...current,
      transactions: current.transactions.filter((item) => item.id !== id),
    }));
  }, []);

  const upsertBudget = useCallback((budget: Budget) => {
    setFinanceState((current) => {
      const exists = current.budgets.some((item) => item.categoryId === budget.categoryId);
      return {
        ...current,
        budgets: exists
          ? current.budgets.map((item) =>
              item.categoryId === budget.categoryId ? budget : item,
            )
          : [...current.budgets, budget],
      };
    });
  }, []);

  const setCurrency = useCallback((currency: Currency) => {
    setFinanceState((current) => ({ ...current, currency }));
  }, []);

  const resetDemo = useCallback(() => {
    setFinanceState((current) => ({
      ...createInitialState(),
      currency: current.currency,
    }));
  }, []);

  const clearAll = useCallback(() => {
    setFinanceState((current) => ({
      currency: current.currency,
      categories: createInitialState().categories,
      transactions: [],
      budgets: [],
    }));
  }, []);

  const value = useMemo(
    () => ({
      ready,
      state,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      upsertBudget,
      setCurrency,
      resetDemo,
      clearAll,
    }),
    [
      ready,
      state,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      upsertBudget,
      setCurrency,
      resetDemo,
      clearAll,
    ],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used inside FinanceProvider");
  return ctx;
}
