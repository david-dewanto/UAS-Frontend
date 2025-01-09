import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Transaction, 
  PortfolioReturnResponse,
  investmentService 
} from '@/lib/investment';

interface PortfolioSummaryProps {
  transactions: Transaction[];
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [returns, setReturns] = useState<PortfolioReturnResponse | null>(null);
  const [totalValue, setTotalValue] = useState<number>(0);

  useEffect(() => {
    const calculateMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get current holdings
        const holdings = investmentService.calculateCurrentHoldings(transactions);
        
        // Get latest prices for holdings
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        let portfolioValue = 0;
        
        // Calculate current portfolio value
        await Promise.all(
          Object.entries(holdings).map(async ([stockCode, quantity]) => {
            const priceData = await investmentService.getStockPrice(
              stockCode,
              lastWeek,
              today
            );
            
            if (priceData.prices.length > 0) {
              const latestPrice = priceData.prices[priceData.prices.length - 1].closing_price;
              portfolioValue += latestPrice * quantity;
            }
          })
        );
        
        setTotalValue(portfolioValue);

        // Calculate returns
        if (transactions.length > 0) {
          const returnData = await investmentService.calculateReturns(
            transactions.map(tx => ({
              stock_code: tx.stock_code,
              transaction_type: tx.transaction_type,
              quantity: tx.quantity,
              price_per_share: tx.price_per_share,
              total_value: tx.total_value,
              transaction_date: tx.transaction_date,
            }))
          );
          
          setReturns(returnData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to calculate portfolio metrics');
      } finally {
        setIsLoading(false);
      }
    };

    if (transactions.length > 0) {
      calculateMetrics();
    } else {
      setIsLoading(false);
    }
  }, [transactions]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

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
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
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
          ) : returns ? (
            <div className="text-2xl font-bold">
              {formatPercent(returns.portfolio_twr)}
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
          ) : returns ? (
            <div className="text-2xl font-bold">
              {formatPercent(returns.portfolio_mwr)}
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
          ) : returns ? (
            <div className="text-2xl font-bold">
              {Math.ceil(
                (returns.end_date.getTime() - returns.start_date.getTime()) / 
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