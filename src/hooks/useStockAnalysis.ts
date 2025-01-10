// src/hooks/useStockAnalysis.ts
import { useState, useEffect } from 'react';
import { companyService, StockAnalysisData, UseStockAnalysisResult } from '@/lib/company';
import { investmentService } from '@/lib/investment';
import { useMemo } from 'react';


interface UseStockAnalysisProps {
  stockSymbol: string | null;
  startDate: Date;
  endDate: Date;
}

export function useStockAnalysis({ 
  stockSymbol, 
  startDate, 
  endDate 
}: UseStockAnalysisProps): UseStockAnalysisResult {
  const [data, setData] = useState<StockAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when stock symbol changes
    if (!stockSymbol) {
      setData(null);
      setError(null);
      return;
    }

    const fetchStockData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch all data in parallel
        const [companyInfo, priceData, riskMetrics] = await Promise.all([
          // Company information
          companyService.getCompanyInfo(stockSymbol).catch(error => {
            console.error('Error fetching company info:', error);
            return null;
          }),

          // Stock price data
          investmentService.getStockPrice(
            stockSymbol, 
            startDate, 
            endDate
          ).catch(error => {
            console.error('Error fetching price data:', error);
            return null;
          }),

          // Risk metrics (Sharpe ratio)
          investmentService.getSharpeRatio(stockSymbol).catch(error => {
            console.error('Error fetching risk metrics:', error);
            return null;
          })
        ]);

        setData({
          companyInfo,
          priceData,
          riskMetrics
        });

      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Failed to fetch stock data';
        setError(errorMessage);
        console.error('Error in useStockAnalysis:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, [stockSymbol, startDate, endDate]);

  return { data, isLoading, error };
}

export function useStockPriceChart(data: StockAnalysisData | null) {
  return useMemo(() => {
    if (!data?.priceData?.prices) return [];

    return data.priceData.prices.map(price => ({
      date: new Date(price.date).toISOString().split('T')[0],
      price: price.closing_price,
      volume: price.volume_thousands, // Keep as thousands
      closing_price: price.closing_price,
      volume_thousands: price.volume_thousands
    }));
  }, [data?.priceData]);
}