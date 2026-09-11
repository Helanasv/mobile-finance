"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { createInitialState } from "@/lib/defaults";
import { withDueRecurring } from "@/lib/finance";
import {
  getFinanceSnapshot,
  getServerFinanceSnapshot,
  setFinanceState,
  subscribeFinance,
} from "@/lib/store";
import { messages } from "@/lib/i18n";
import type {
  Currency,
  FinanceState,
  Goal,
  Locale,
  Recurring,
  Transaction,
} from "@/lib/types";

type FinanceContextValue = {
  ready: boolean;
  state: FinanceState;
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addGoal: (goal: Omit<Goal, "id">) => void;
  addToGoal: (id: string, amount: number) => void;
  deleteGoal: (id: string) => void;
  addRecurring: (item: Omit<Recurring, "id">) => void;
  deleteRecurring: (id: string) => void;
  setCurrency: (currency: Currency) => void;
  setLocale: (locale: Locale) => void;
  setDisplayName: (displayName: string) => void;
  completeSetup: (locale: Locale, currency: Currency) => void;
  resetDemo: () => void;
  clearAll: () => void;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
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

  const addGoal = useCallback((goal: Omit<Goal, "id">) => {
    setFinanceState((current) => ({
      ...current,
      goals: [{ ...goal, id: crypto.randomUUID() }, ...current.goals],
    }));
  }, []);

  const addToGoal = useCallback((id: string, amount: number) => {
    setFinanceState((current) => ({
      ...current,
      goals: current.goals.map((goal) =>
        goal.id === id ? { ...goal, saved: Math.round((goal.saved + amount) * 100) / 100 } : goal,
      ),
    }));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setFinanceState((current) => ({
      ...current,
      goals: current.goals.filter((goal) => goal.id !== id),
    }));
  }, []);

  const addRecurring = useCallback((item: Omit<Recurring, "id">) => {
    setFinanceState((current) =>
      withDueRecurring({
        ...current,
        recurrings: [{ ...item, id: crypto.randomUUID() }, ...current.recurrings],
      }),
    );
  }, []);

  const deleteRecurring = useCallback((id: string) => {
    setFinanceState((current) => ({
      ...current,
      recurrings: current.recurrings.filter((item) => item.id !== id),
    }));
  }, []);

  const setCurrency = useCallback((currency: Currency) => {
    setFinanceState((current) => ({ ...current, currency }));
  }, []);

  const setLocale = useCallback((locale: Locale) => {
    setFinanceState((current) => ({ ...current, locale }));
  }, []);

  const setDisplayName = useCallback((displayName: string) => {
    setFinanceState((current) => ({ ...current, displayName: displayName.trim() }));
  }, []);

  const completeSetup = useCallback((locale: Locale, currency: Currency) => {
    setFinanceState((current) => ({ ...current, locale, currency, setupComplete: true }));
  }, []);

  const resetDemo = useCallback(() => {
    setFinanceState((current) => ({
      ...createInitialState(),
      currency: current.currency,
      locale: current.locale,
      setupComplete: current.setupComplete,
      displayName: current.displayName,
    }));
  }, []);

  const clearAll = useCallback(() => {
    setFinanceState((current) => ({
      locale: current.locale,
      currency: current.currency,
      setupComplete: current.setupComplete,
      displayName: current.displayName,
      categories: createInitialState().categories,
      transactions: [],
      budgets: [],
      goals: [],
      recurrings: [],
      monthLimit: 0,
    }));
  }, []);

  const value = useMemo(
    () => ({
      ready,
      state,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addGoal,
      addToGoal,
      deleteGoal,
      addRecurring,
      deleteRecurring,
      setCurrency,
      setLocale,
      setDisplayName,
      completeSetup,
      resetDemo,
      clearAll,
    }),
    [
      ready,
      state,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addGoal,
      addToGoal,
      deleteGoal,
      addRecurring,
      deleteRecurring,
      setCurrency,
      setLocale,
      setDisplayName,
      completeSetup,
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

export function useT() {
  const { state } = useFinance();
  return messages[state.locale ?? "ru"];
}

export function useLocale() {
  const { state } = useFinance();
  return state.locale ?? "ru";
}
