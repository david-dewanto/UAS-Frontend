import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartBarIcon, ShieldCheckIcon, AlertTriangleIcon } from "lucide-react";
import { Transaction, investmentService } from "@/lib/investment";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useStockTrendAnalysis } from "@/hooks/useStockTrendAnalysis";

interface ReturnMetricsProps {
  transactions: Transaction[];
}

interface StockMetrics {
  stockCode: string;
  sharpeRatio: number;
  averageReturn: number;
  volatility: number;
  trendStrength?: number | null;
  forecastMetrics?: {
    mae: number;
    rmse: number;
  } | null;
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatDecimal(value: number | undefined | null): string {
  if (value == null) return "N/A";
  return value.toFixed(2);
}

export function ReturnMetrics({ transactions }: ReturnMetricsProps) {
  const [metrics, setMetrics] = useState<StockMetrics[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const renderRiskIndicator = (sharpeRatio: number) => {
    if (sharpeRatio >= 1) {
      return (
        <div className="flex items-center gap-1 text-green-500 ml-auto w-fit">
          <ShieldCheckIcon className="h-4 w-4" />
          <span>Good</span>
        </div>
      );
    } else if (sharpeRatio >= 0) {
      return (
        <div className="flex items-center gap-1 text-yellow-500 ml-auto w-fit">
          <ChartBarIcon className="h-4 w-4" />
          <span>Fair</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 text-red-500 ml-auto w-fit">
          <AlertTriangleIcon className="h-4 w-4" />
          <span>Poor</span>
        </div>
      );
    }
  };

  // Get dates for price data
  const today = useMemo(() => new Date(), []);
  const lastWeek = useMemo(() => {
    const date = new Date(today);
    date.setDate(date.getDate() - 7);
    return date;
  }, [today]);

  // Get unique stock codes
  const stockCodes = useMemo(
    () => [...new Set(transactions.map((tx) => tx.stock_code))],
    [transactions]
  );

  // Fetch stock prices using the existing hook
  const {
    isLoading: isPricesLoading,
    error: pricesError,
  } = useStockPrices(transactions, lastWeek, today);

  // Fetch trend analysis using our new hook
  const {
    isLoading: isTrendLoading,
    error: trendError,
    getTrendStrength,
    getForecastMetrics,
  } = useStockTrendAnalysis(stockCodes);

  // Calculate metrics
useEffect(() => {
  const calculateMetrics = async () => {
    // Only proceed if neither is loading and we have stock codes
    if (isPricesLoading || isTrendLoading || stockCodes.length === 0) {
      return;
    }

    try {
      setIsCalculating(true);
      setError(null);

      // Get Sharpe ratios for each stock ONCE
      const sharpePromises = stockCodes.map(stockCode => 
        investmentService.getSharpeRatio(stockCode)
      );

      // Wait for all Sharpe ratios
      const sharpeResults = await Promise.all(sharpePromises);

      // Combine with trend analysis
      const stockMetrics = sharpeResults.map((sharpeData, index) => {
        const stockCode = stockCodes[index];
        return {
          stockCode,
          sharpeRatio: sharpeData.sharpe_ratio,
          averageReturn: sharpeData.avg_annual_return * 100,
          volatility: sharpeData.return_volatility * 100,
          trendStrength: getTrendStrength(stockCode),
          forecastMetrics: getForecastMetrics(stockCode)
        };
      });

      setMetrics(stockMetrics.sort((a, b) => a.stockCode.localeCompare(b.stockCode)));
    } catch (err) {
      console.error('Error calculating metrics:', err);
      setError(err instanceof Error ? err.message : "Failed to calculate return metrics");
    } finally {
      setIsCalculating(false);
    }
  };

  calculateMetrics();
}, [stockCodes, isPricesLoading, isTrendLoading]);

  if (pricesError || trendError || error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {pricesError || trendError || error}
        </AlertDescription>
      </Alert>
    );
  }

  const isLoading = isPricesLoading || isTrendLoading || isCalculating;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Return Metrics</CardTitle>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <ShieldCheckIcon className="h-4 w-4 text-green-500" />
              <span>Sharpe ≥ 1</span>
            </div>
            <div className="flex items-center gap-1">
              <ChartBarIcon className="h-4 w-4 text-yellow-500" />
              <span>0 ≤ Sharpe &lt; 1</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangleIcon className="h-4 w-4 text-red-500" />
              <span>Sharpe &lt; 0</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
        ) : metrics.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No return metrics available
          </p>
        ) : (
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Stock</TableHead>
                  <TableHead className="text-right w-[120px]">
                    Avg. Return
                  </TableHead>
                  <TableHead className="text-right w-[100px]">
                    Volatility
                  </TableHead>
                  <TableHead className="text-right w-[120px]">
                    Sharpe Ratio
                  </TableHead>
                  <TableHead className="text-right w-[100px]">
                    Risk Level
                  </TableHead>
                  <TableHead className="text-right w-[100px]">
                    Trend Strength
                  </TableHead>
                  <TableHead className="text-right w-[100px]">
                    Forecast Error
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map((stock) => (
                  <TableRow key={stock.stockCode}>
                    <TableCell className="font-medium">
                      {stock.stockCode}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          stock.averageReturn >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {formatPercent(stock.averageReturn)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPercent(stock.volatility)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatDecimal(stock.sharpeRatio)}
                    </TableCell>
                    <TableCell className="text-right">
                      {renderRiskIndicator(stock.sharpeRatio)}
                    </TableCell>
                    <TableCell className="text-right">
                      {stock.trendStrength !== null
                        ? formatDecimal(stock.trendStrength)
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      {stock.forecastMetrics
                        ? formatDecimal(stock.forecastMetrics.rmse)
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
