const rubles = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

export function formatMoney(amount: number) {
  return rubles.format(amount);
}

export function formatSignedMoney(amount: number, type: "income" | "expense") {
  const value = formatMoney(amount);
  return type === "income" ? `+${value}` : `−${value}`;
}

export function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function parseMonthKey(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

export function formatMonthTitle(key: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(parseMonthKey(key));
}

export function formatDayHeading(isoDate: string) {
  const date = new Date(`${isoDate}T12:00:00`);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (sameDay(date, today)) return "Сегодня";
  if (sameDay(date, yesterday)) return "Вчера";

  return new Intl.DateTimeFormat("ru-RU", {
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
