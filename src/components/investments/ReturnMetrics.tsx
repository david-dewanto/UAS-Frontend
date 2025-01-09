import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ChartBarIcon, 
  ShieldCheckIcon,
  AlertTriangleIcon
} from 'lucide-react';
import { Transaction, investmentService } from '@/lib/investment';
import { useStockPrices } from '@/hooks/useStockPrices';

interface ReturnMetricsProps {
  transactions: Transaction[];
}

interface StockMetrics {
  stockCode: string;
  twr: number;
  mwr: number;
  sharpeRatio: number;
  averageReturn: number;
  volatility: number;
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatDecimal(value: number): string {
  return value.toFixed(2);
}

export function ReturnMetrics({ transactions }: ReturnMetricsProps) {
  const [metrics, setMetrics] = useState<StockMetrics[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get dates for price data
  const today = useMemo(() => new Date(), []);
  const lastWeek = useMemo(() => {
    const date = new Date(today);
    date.setDate(date.getDate() - 7);
    return date;
  }, [today]);

  // Fetch stock prices using the hook
  const { isLoading: isPricesLoading, error: pricesError, stockPrices } = useStockPrices(
    transactions,
    lastWeek,
    today
  );

  // Calculate metrics
  useEffect(() => {
    const calculateMetrics = async () => {
      if (isPricesLoading || pricesError || !Object.keys(stockPrices).length) {
        return;
      }

      try {
        setIsCalculating(true);
        setError(null);

        if (transactions.length === 0) {
          setMetrics([]);
          return;
        }

        // Get unique stock codes
        const stockCodes = [...new Set(transactions.map(tx => tx.stock_code))];

        // Calculate returns for all stocks
        const returns = await investmentService.calculateReturns(
          transactions.map(tx => ({
            stock_code: tx.stock_code,
            transaction_type: tx.transaction_type,
            quantity: tx.quantity,
            price_per_share: tx.price_per_share,
            total_value: tx.total_value,
            transaction_date: tx.transaction_date,
          }))
        );

        // Get Sharpe ratios for each stock
        const stockMetrics = await Promise.all(
          stockCodes.map(async (stockCode) => {
            try {
              const sharpeData = await investmentService.getSharpeRatio(stockCode);
              
              return {
                stockCode,
                twr: returns.stock_breakdown[stockCode]?.twr || 0,
                mwr: returns.stock_breakdown[stockCode]?.mwr || 0,
                sharpeRatio: sharpeData.sharpe_ratio,
                averageReturn: sharpeData.avg_annual_return * 100, // Convert to percentage
                volatility: sharpeData.return_volatility * 100, // Convert to percentage
              };
            } catch (error) {
              console.error(`Error fetching metrics for ${stockCode}:`, error);
              return {
                stockCode,
                twr: returns.stock_breakdown[stockCode]?.twr || 0,
                mwr: returns.stock_breakdown[stockCode]?.mwr || 0,
                sharpeRatio: 0,
                averageReturn: 0,
                volatility: 0,
              };
            }
          })
        );

        // Sort alphabetically by stock code
        setMetrics(stockMetrics.sort((a, b) => a.stockCode.localeCompare(b.stockCode)));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to calculate return metrics');
      } finally {
        setIsCalculating(false);
      }
    };

    calculateMetrics();
  }, [transactions, stockPrices, isPricesLoading, pricesError]);

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

  if (pricesError || error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{pricesError || error}</AlertDescription>
      </Alert>
    );
  }

  const isLoading = isPricesLoading || isCalculating;

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
                  <TableHead className="text-right w-[80px]">TWR</TableHead>
                  <TableHead className="text-right w-[80px]">MWR</TableHead>
                  <TableHead className="text-right w-[120px]">Avg. Return</TableHead>
                  <TableHead className="text-right w-[100px]">Volatility</TableHead>
                  <TableHead className="text-right w-[120px]">Sharpe Ratio</TableHead>
                  <TableHead className="text-right w-[100px]">Risk Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map((stock) => (
                  <TableRow key={stock.stockCode}>
                    <TableCell className="font-medium">
                      {stock.stockCode}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={stock.twr >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {formatPercent(stock.twr * 100)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={stock.mwr >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {formatPercent(stock.mwr * 100)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={stock.averageReturn >= 0 ? 'text-green-500' : 'text-red-500'}>
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