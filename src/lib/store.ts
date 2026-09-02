import { createInitialState } from "@/lib/defaults";
import { loadState, saveState } from "@/lib/storage";
import type { FinanceState } from "@/lib/types";

const listeners = new Set<() => void>();
let snapshot: FinanceState | null = null;
const serverSnapshot = createInitialState();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeFinance(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getFinanceSnapshot(): FinanceState {
  if (!snapshot) snapshot = loadState();
  return snapshot;
}

export function getServerFinanceSnapshot(): FinanceState {
  return serverSnapshot;
}

export function setFinanceState(
  updater: FinanceState | ((current: FinanceState) => FinanceState),
) {
  const current = getFinanceSnapshot();
  snapshot = typeof updater === "function" ? updater(current) : updater;
  saveState(snapshot);
  emit();
}
