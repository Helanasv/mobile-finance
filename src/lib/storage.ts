import { createInitialState } from "@/lib/defaults";
import { isCurrency } from "@/lib/currency";
import { isLocale } from "@/lib/i18n";
import type { FinanceState } from "@/lib/types";

function clampPayday(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 28
    ? value
    : 1;
}

export const STORAGE_KEY = "karman-finance-v2";

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
      locale: isLocale(parsed.locale) ? parsed.locale : null,
      currency: isCurrency(parsed.currency) ? parsed.currency : "RUB",
      setupComplete: parsed.setupComplete === true,
      displayName: typeof parsed.displayName === "string" ? parsed.displayName : "",
      categories: parsed.categories,
      transactions: parsed.transactions,
      goals: Array.isArray(parsed.goals)
        ? parsed.goals.map((goal) =>
            goal.name === "Подушка" || goal.name === "Cushion"
              ? { ...goal, name: parsed.locale === "en" ? "Reserve" : "Запас" }
              : goal,
          )
        : [],
      recurrings: Array.isArray(parsed.recurrings) ? parsed.recurrings : [],
      monthLimit: 0,
      budgets: [],
      paydayDay: clampPayday(parsed.paydayDay),
      briefingDismissedOn:
        typeof parsed.briefingDismissedOn === "string" ? parsed.briefingDismissedOn : null,
      weeklyNoteDismissedWeek:
        typeof parsed.weeklyNoteDismissedWeek === "string"
          ? parsed.weeklyNoteDismissedWeek
          : null,
    };
  } catch {
    return createInitialState();
  }
}

export function saveState(state: FinanceState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
