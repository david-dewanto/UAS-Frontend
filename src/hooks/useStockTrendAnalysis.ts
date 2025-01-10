import { useState, useEffect, useMemo } from "react";
import { investmentService, StockAnalysisResponse } from "@/lib/investment";

interface TrendAnalysisCache {
  data: StockAnalysisResponse;
  fetchedAt: number;
}

export function useStockTrendAnalysis(stockCodes: string[]) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<StockAnalysisResponse | null>(null);
  const [cache, setCache] = useState<TrendAnalysisCache | null>(null);

  // Move these functions outside useEffect so they're stable
  const getTrendStrength = useMemo(() => (stockCode: string) => {
    if (!analysisData?.analysis[`category_${stockCode}`]) return null;
    return analysisData.analysis[`category_${stockCode}`].trend.strength;
  }, [analysisData]);

  const getForecastMetrics = useMemo(() => (stockCode: string) => {
    if (!analysisData?.analysis[`category_${stockCode}`]) return null;
    return analysisData.analysis[`category_${stockCode}`].forecast.metrics;
  }, [analysisData]);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (stockCodes.length === 0) {
        setAnalysisData(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const sortedCodes = [...stockCodes].sort();
        const cacheKey = sortedCodes.join(',');

        if (cache && 
            Date.now() - cache.fetchedAt < 5 * 60 * 1000 && 
            cacheKey === JSON.stringify(sortedCodes)) {
          setAnalysisData(cache.data);
          setIsLoading(false);
          return;
        }

        const data = await investmentService.analyzeStocks(sortedCodes);
        setCache({
          data,
          fetchedAt: Date.now()
        });
        setAnalysisData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to analyze stocks');
        console.error('Error in useStockTrendAnalysis:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [stockCodes]); // Only depend on stockCodes

  return { 
    isLoading, 
    error, 
    analysisData,
    getTrendStrength,
    getForecastMetrics
  };
}