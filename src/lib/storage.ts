import { createInitialState } from "@/lib/defaults";
import type { FinanceState } from "@/lib/types";

export const STORAGE_KEY = "karman-finance-v1";

export function loadState(): FinanceState {
  if (typeof window === "undefined") return createInitialState();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as FinanceState;
    if (!parsed.categories?.length || !Array.isArray(parsed.transactions)) {
      return createInitialState();
    }
    return {
      categories: parsed.categories,
      transactions: parsed.transactions,
      budgets: parsed.budgets ?? [],
    };
  } catch {
    return createInitialState();
  }
}

export function saveState(state: FinanceState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
