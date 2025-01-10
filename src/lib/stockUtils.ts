// src/lib/stockUtils.ts
import { StockPrice } from './utils';

export interface ProcessedHolding {
  stockCode: string;
  quantity: number;
  prices: {
    date: string;
    closing_price: number;
  }[];
}

/**
 * Find the nearest available price looking forward up to 14 days
 */
function findNearestForwardPrice(
  prices: { date: string; closing_price: number }[],
  targetDate: Date,
  maxDaysForward: number = 14
): { date: string; closing_price: number } | null {
  const sortedPrices = [...prices].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const targetTime = targetDate.getTime();
  const maxTime = targetTime + (maxDaysForward * 24 * 60 * 60 * 1000);

  for (const price of sortedPrices) {
    const priceTime = new Date(price.date).getTime();
    
    // Skip prices before target date
    if (priceTime < targetTime) continue;
    
    // If we've gone too far forward, stop searching
    if (priceTime > maxTime) break;

    // Found a valid price
    if (price.closing_price > 0) {
      return price;
    }
  }

  return null;
}

/**
 * Processes stock price data to get values at specific intervals
 */
export function processStockPrices(
  rawPrices: StockPrice[],
  datePoints: Date[],
): { date: string; value: number }[] {
  return datePoints.map(targetDate => {
    // First try to find an exact match or closest previous price
    const validPrices = rawPrices.filter(
      price => new Date(price.date) <= targetDate
    );
    
    if (validPrices.length > 0) {
      // Get the most recent price before or on the target date
      const closestPrice = validPrices.reduce((prev, curr) => {
        const prevDiff = Math.abs(new Date(prev.date).getTime() - targetDate.getTime());
        const currDiff = Math.abs(new Date(curr.date).getTime() - targetDate.getTime());
        return currDiff < prevDiff ? curr : prev;
      });

      if (closestPrice.closing_price > 0) {
        return {
          date: targetDate.toISOString().split('T')[0],
          value: closestPrice.closing_price
        };
      }
    }

    // If we didn't find a valid price, look forward
    const nearestForwardPrice = findNearestForwardPrice(rawPrices, targetDate);
    
    if (nearestForwardPrice) {
      return {
        date: targetDate.toISOString().split('T')[0], // Keep original date for display
        value: nearestForwardPrice.closing_price
      };
    }

    // If still no valid price found, return 0
    return {
      date: targetDate.toISOString().split('T')[0],
      value: 0
    };
  });
}

/**
 * Calculates portfolio value for given holdings and date points
 */
export function calculatePortfolioValues(
  holdings: ProcessedHolding[],
  datePoints: Date[]
): { date: string; value: number }[] {
  // Initialize the result array with all dates and zero values
  const portfolioValues = datePoints.map(date => ({
    date: date.toISOString().split('T')[0],
    value: 0
  }));

  // For each holding, calculate its contribution to the portfolio value
  holdings.forEach(holding => {
    const stockValues = processStockPrices(holding.prices, datePoints);
    
    // Add this stock's value to the total for each date
    stockValues.forEach((stockValue, index) => {
      portfolioValues[index].value += stockValue.value * holding.quantity;
    });
  });

  return portfolioValues;
}