// src/lib/utils.ts

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface StockPrice {
  date: string;
  closing_price: number;
}

export interface StockPriceData {
  stockCode: string;
  prices: StockPrice[];
}

/**
 * Finds the closest stock price for a given date
 */
export function getClosestPriceForDate(prices: StockPrice[], targetDate: Date): number | null {
  if (!prices.length) return null;

  // Convert all dates to timestamps for comparison
  const targetTime = targetDate.getTime();
  const pricesWithTimestamp = prices.map(price => ({
    ...price,
    timestamp: new Date(price.date).getTime()
  }));

  // Find the closest date
  let closestPrice = pricesWithTimestamp[0];
  let minDiff = Math.abs(targetTime - closestPrice.timestamp);

  for (const price of pricesWithTimestamp) {
    const diff = Math.abs(targetTime - price.timestamp);
    if (diff < minDiff) {
      minDiff = diff;
      closestPrice = price;
    }
  }

  return closestPrice.closing_price;
}

/**
 * Generates date points between two dates based on the specified interval
 */
export function generateDatePoints(
  startDate: Date, 
  endDate: Date, 
  interval: 'day' | 'week' | 'month'
): Date[] {
  const dates: Date[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    
    switch (interval) {
      case 'day':
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'week':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'month':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
    }
  }

  // Add end date if it's not already included
  if (currentDate.getTime() !== endDate.getTime()) {
    dates.push(new Date(endDate));
  }

  return dates;
}

/**
 * Format a number as Indonesian Rupiah
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a number as percentage
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Format a number as decimal
 */
export function formatDecimal(value: number): string {
  return value.toFixed(2);
}