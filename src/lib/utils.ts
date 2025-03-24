import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number, currency: string): string => {
  let country: string = "pt-BR";

  if (currency == "USD") {
    country = "en-US"
  }

  return new Intl.NumberFormat(country, { style: "currency", currency: currency }).format(
    value,
  );
}