export type Currency = "RUB" | "USD" | "BYN" | "EUR";

export const CURRENCIES: {
  code: Currency;
  label: Record<"ru" | "en", string>;
  short: string;
  symbol: string;
}[] = [
  { code: "RUB", label: { ru: "Российский рубль", en: "Russian ruble" }, short: "RUB", symbol: "₽" },
  { code: "USD", label: { ru: "Доллар США", en: "US dollar" }, short: "USD", symbol: "$" },
  { code: "BYN", label: { ru: "Белорусский рубль", en: "Belarusian ruble" }, short: "BYN", symbol: "Br" },
  { code: "EUR", label: { ru: "Евро", en: "Euro" }, short: "EUR", symbol: "€" },
];

const CODES = new Set<string>(CURRENCIES.map((item) => item.code));

export function isCurrency(value: unknown): value is Currency {
  return typeof value === "string" && CODES.has(value);
}

export function currencyMeta(code: Currency) {
  return CURRENCIES.find((item) => item.code === code) ?? CURRENCIES[0];
}
