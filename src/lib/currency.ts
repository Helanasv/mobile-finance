export type Currency = "RUB" | "USD" | "BYN" | "EUR";

export const CURRENCIES: {
  code: Currency;
  label: string;
  short: string;
  symbol: string;
}[] = [
  { code: "RUB", label: "Российский рубль", short: "RUB", symbol: "₽" },
  { code: "USD", label: "Доллар США", short: "USD", symbol: "$" },
  { code: "BYN", label: "Белорусский рубль", short: "BYN", symbol: "Br" },
  { code: "EUR", label: "Евро", short: "EUR", symbol: "€" },
];

const CODES = new Set<string>(CURRENCIES.map((item) => item.code));

export function isCurrency(value: unknown): value is Currency {
  return typeof value === "string" && CODES.has(value);
}

export function currencyMeta(code: Currency) {
  return CURRENCIES.find((item) => item.code === code) ?? CURRENCIES[0];
}
