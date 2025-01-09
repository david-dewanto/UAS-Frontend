import { useState, useEffect } from 'react';
import { investmentService } from '@/lib/investment';
import { Transaction } from '@/lib/investment';

interface StockPriceCache {
  [key: string]: {
    [dateRange: string]: {
      prices: {
        date: string;
        closing_price: number;
      }[];
      fetchedAt: number;
    };
  };
}

interface StockPriceData {
  [stockCode: string]: {
    prices: {
      date: string;
      closing_price: number;
    }[];
  };
}

export interface UseStockPricesResult {
  isLoading: boolean;
  error: string | null;
  stockPrices: StockPriceData;
}

export function useStockPrices(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): UseStockPricesResult {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockPrices, setStockPrices] = useState<StockPriceData>({});
  const [cache] = useState<StockPriceCache>({});

  useEffect(() => {
    const fetchStockPrices = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (transactions.length === 0) {
          setStockPrices({});
          return;
        }

        // Get unique stock codes from transactions
        const stockCodes = [...new Set(transactions.map(tx => tx.stock_code))];
        
        // Format date range string
        const dateRange = `${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}`;

        // Prepare promises for all required stock price requests
        const pricePromises = stockCodes.map(async (stockCode) => {
          // Check cache first
          if (
            cache[stockCode]?.[dateRange] &&
            Date.now() - cache[stockCode][dateRange].fetchedAt < 60000 // Cache for 1 minute
          ) {
            return {
              stockCode,
              data: cache[stockCode][dateRange]
            };
          }

          // Fetch new data if not in cache
          const response = await investmentService.getStockPrice(
            stockCode,
            startDate,
            endDate
          );

          // Prepare the cached data structure
          const priceData = {
            prices: response.prices.map(price => ({
              date: price.date.toISOString().split('T')[0],
              closing_price: price.closing_price
            })),
            fetchedAt: Date.now()
          };

          // Update cache
          if (!cache[stockCode]) {
            cache[stockCode] = {};
          }
          cache[stockCode][dateRange] = priceData;

          return {
            stockCode,
            data: priceData
          };
        });

        // Wait for all requests to complete
        const results = await Promise.all(pricePromises);

        // Transform results into the required format
        const newPrices = results.reduce((acc, { stockCode, data }) => {
          acc[stockCode] = {
            prices: data.prices
          };
          return acc;
        }, {} as StockPriceData);

        setStockPrices(newPrices);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stock prices');
        console.error('Error fetching stock prices:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockPrices();
  }, [transactions, startDate, endDate]);

  return {
    isLoading,
    error,
    stockPrices
  };
}