import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Transaction, 
  PortfolioReturnResponse,
  investmentService 
} from '@/lib/investment';
import { useStockPrices } from '@/hooks/useStockPrices';

interface PortfolioSummaryProps {
  transactions: Transaction[];
}

interface PortfolioMetrics {
  totalValue: number;
  returns: PortfolioReturnResponse | null;
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function PortfolioSummary({ transactions }: PortfolioSummaryProps) {
  const [metrics, setMetrics] = useState<PortfolioMetrics>({
    totalValue: 0,
    returns: null
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get dates for fetching recent prices
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

  // Calculate portfolio metrics
  useEffect(() => {
    const calculateMetrics = async () => {
      if (isPricesLoading || pricesError || !Object.keys(stockPrices).length) {
        return;
      }

      try {
        setIsCalculating(true);
        setError(null);

        // Get current holdings
        const holdings = investmentService.calculateCurrentHoldings(transactions);

        // Calculate total portfolio value
        let portfolioValue = 0;
        Object.entries(holdings).forEach(([stockCode, quantity]) => {
          const priceData = stockPrices[stockCode]?.prices || [];
          if (priceData.length > 0) {
            const latestPrice = priceData[priceData.length - 1].closing_price;
            portfolioValue += latestPrice * quantity;
          }
        });

        // Calculate returns if there are transactions
        let returnData = null;
        if (transactions.length > 0) {
          returnData = await investmentService.calculateReturns(
            transactions.map(tx => ({
              stock_code: tx.stock_code,
              transaction_type: tx.transaction_type,
              quantity: tx.quantity,
              price_per_share: tx.price_per_share,
              total_value: tx.total_value,
              transaction_date: tx.transaction_date,
            }))
          );
        }

        setMetrics({
          totalValue: portfolioValue,
          returns: returnData
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to calculate portfolio metrics');
      } finally {
        setIsCalculating(false);
      }
    };

    calculateMetrics();
  }, [transactions, stockPrices, isPricesLoading, pricesError]);

  if (pricesError || error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{pricesError || error}</AlertDescription>
      </Alert>
    );
  }

  const isLoading = isPricesLoading || isCalculating;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Portfolio Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-7 w-[120px]" />
          ) : (
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.totalValue)}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Time-Weighted Return
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-7 w-[90px]" />
          ) : metrics.returns ? (
            <div className="text-2xl font-bold">
              {formatPercent(metrics.returns.portfolio_twr)}
            </div>
          ) : (
            <div className="text-muted-foreground">No data</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Money-Weighted Return
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-7 w-[90px]" />
          ) : metrics.returns ? (
            <div className="text-2xl font-bold">
              {formatPercent(metrics.returns.portfolio_mwr)}
            </div>
          ) : (
            <div className="text-muted-foreground">No data</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Investment Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-7 w-[90px]" />
          ) : metrics.returns ? (
            <div className="text-2xl font-bold">
              {Math.ceil(
                (metrics.returns.end_date.getTime() - metrics.returns.start_date.getTime()) / 
                (1000 * 60 * 60 * 24 * 30)
              )} months
            </div>
          ) : (
            <div className="text-muted-foreground">No data</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}