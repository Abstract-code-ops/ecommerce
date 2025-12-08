import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatNumberWithDecimal = (num: number): string => {
  const [int, decimal] = num.toString().split(".");
  return decimal ? `${int}.${decimal}` : int;
}

export const toSlug = (text:string): string => 
  text
    .toLowerCase()
    .replace(/[^\w\s-]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  currency: "AED",
  style: "currency",
  minimumFractionDigits: 2
});

export const formatCurrency = (amount: number) => 
CURRENCY_FORMATTER.format(amount);

const NUMBER_FORMATTER = new Intl.NumberFormat('en-US')
export function formatNumber(num: number) {
  return NUMBER_FORMATTER.format(num)
}

export const round2Decimals = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export const generateId = (): string => 
  Array.from({ length: 24 }, () => Math.floor(Math.random() * 10).toString(10)).join('');
