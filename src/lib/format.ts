import type { Currency } from "@/lib/currency";
import type { Locale } from "@/lib/i18n";
import { messages, intlTag } from "@/lib/i18n";

const formatterCache = new Map<string, Intl.NumberFormat>();

function moneyFormatter(currency: Currency, locale: Locale) {
  const key = `${locale}-${currency}`;
  const cached = formatterCache.get(key);
  if (cached) return cached;
  const formatter = new Intl.NumberFormat(intlTag(locale), {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  });
  formatterCache.set(key, formatter);
  return formatter;
}

export function formatMoney(amount: number, currency: Currency, locale: Locale = "ru") {
  return moneyFormatter(currency, locale).format(amount);
}

export function formatSignedMoney(
  amount: number,
  type: "income" | "expense",
  currency: Currency,
  locale: Locale = "ru",
) {
  const value = formatMoney(amount, currency, locale);
  return type === "income" ? `+${value}` : `−${value}`;
}

export function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function parseMonthKey(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

export function formatMonthTitle(key: string, locale: Locale = "ru") {
  return new Intl.DateTimeFormat(intlTag(locale), {
    month: "long",
    year: "numeric",
  }).format(parseMonthKey(key));
}

export function formatShortDate(isoDate: string, locale: Locale = "ru") {
  return new Intl.DateTimeFormat(intlTag(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${isoDate}T12:00:00`));
}

export function formatDayHeading(isoDate: string, locale: Locale = "ru") {
  const date = new Date(`${isoDate}T12:00:00`);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const t = messages[locale];

  if (sameDay(date, today)) return t.today;
  if (sameDay(date, yesterday)) return t.yesterday;

  return new Intl.DateTimeFormat(intlTag(locale), {
    day: "numeric",
    month: "long",
    weekday: "short",
  }).format(date);
}

export function todayIso() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function shiftMonth(key: string, delta: number) {
  const date = parseMonthKey(key);
  date.setMonth(date.getMonth() + delta);
  return monthKey(date);
}

export function inMonth(isoDate: string, key: string) {
  return isoDate.startsWith(key);
}

export function parseAmount(raw: string) {
  const value = Number(raw.replace(",", ".").replace(/\s/g, ""));
  if (!Number.isFinite(value)) return NaN;
  return Math.round(value * 100) / 100;
}

export function monthLastDay(key: string) {
  const date = parseMonthKey(key);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function isoDateInMonth(key: string, day: number) {
  const clamped = Math.min(Math.max(1, day), monthLastDay(key));
  return `${key}-${String(clamped).padStart(2, "0")}`;
}
