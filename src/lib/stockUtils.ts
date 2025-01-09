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
 * Processes stock price data to get values at specific intervals
 */
export function processStockPrices(
  rawPrices: StockPrice[],
  datePoints: Date[],
): { date: string; value: number }[] {
  return datePoints.map(targetDate => {
    // Find the closest price date that's not after the target date
    const validPrices = rawPrices.filter(
      price => new Date(price.date) <= targetDate
    );
    
    if (validPrices.length === 0) {
      return {
        date: targetDate.toISOString().split('T')[0],
        value: 0
      };
    }

    // Get the most recent price before or on the target date
    const closestPrice = validPrices.reduce((prev, curr) => {
      const prevDiff = Math.abs(new Date(prev.date).getTime() - targetDate.getTime());
      const currDiff = Math.abs(new Date(curr.date).getTime() - targetDate.getTime());
      return currDiff < prevDiff ? curr : prev;
    });

    return {
      date: targetDate.toISOString().split('T')[0],
      value: closestPrice.closing_price
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