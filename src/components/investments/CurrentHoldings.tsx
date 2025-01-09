import { useMemo } from 'react';
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
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { Transaction, investmentService } from '@/lib/investment';
import { useStockPrices } from '@/hooks/useStockPrices';

interface CurrentHoldingsProps {
  transactions: Transaction[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function CurrentHoldings({ transactions }: CurrentHoldingsProps) {
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

  // Calculate holdings data
  const holdings = useMemo(() => {
    if (isPricesLoading || pricesError || !Object.keys(stockPrices).length) {
      return [];
    }

    const currentHoldings = investmentService.calculateCurrentHoldings(transactions);

    return Object.entries(currentHoldings).map(([stockCode, quantity]) => {
      // Get latest price
      const priceData = stockPrices[stockCode]?.prices || [];
      const currentPrice = priceData[priceData.length - 1]?.closing_price || 0;

      // Calculate costs
      const stockTransactions = transactions.filter(tx => tx.stock_code === stockCode);
      let totalCost = 0;
      let totalQuantity = 0;

      for (const tx of stockTransactions) {
        if (tx.transaction_type === 'buy') {
          totalCost += tx.total_value;
          totalQuantity += tx.quantity;
        } else {
          // For sells, use FIFO to reduce the cost basis
          const costPerShare = totalCost / totalQuantity;
          totalCost -= costPerShare * tx.quantity;
          totalQuantity -= tx.quantity;
        }
      }

      const totalValue = currentPrice * quantity;
      const averageCost = totalCost / quantity;
      const gainLoss = totalValue - totalCost;
      const gainLossPercentage = (gainLoss / totalCost) * 100;

      return {
        stockCode,
        quantity,
        averageCost,
        currentPrice,
        totalValue,
        totalCost,
        gainLoss,
        gainLossPercentage,
      };
    }).sort((a, b) => a.stockCode.localeCompare(b.stockCode)); // Sort alphabetically by stock code
  }, [transactions, stockPrices, isPricesLoading, pricesError]);

  if (pricesError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{pricesError}</AlertDescription>
      </Alert>
    );
  }

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[300px]" />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Holdings</CardTitle>
      </CardHeader>
      <CardContent>
        {isPricesLoading ? (
          <LoadingSkeleton />
        ) : holdings.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No active holdings
          </p>
        ) : (
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Avg. Cost</TableHead>
                  <TableHead className="text-right">Current Price</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  <TableHead className="text-right">Gain/Loss</TableHead>
                  <TableHead className="text-right">Change %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holdings.map((holding) => (
                  <TableRow key={holding.stockCode}>
                    <TableCell className="font-medium">
                      {holding.stockCode}
                    </TableCell>
                    <TableCell className="text-right">
                      {holding.quantity.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(holding.averageCost)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(holding.currentPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(holding.totalValue)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(holding.totalCost)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {holding.gainLoss > 0 ? (
                          <ArrowUpIcon className="h-4 w-4 text-green-500" />
                        ) : holding.gainLoss < 0 ? (
                          <ArrowDownIcon className="h-4 w-4 text-red-500" />
                        ) : null}
                        <span className={holding.gainLoss > 0 ? 'text-green-500' : 'text-red-500'}>
                          {formatCurrency(Math.abs(holding.gainLoss))}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={holding.gainLossPercentage > 0 ? 'text-green-500' : 'text-red-500'}>
                        {formatPercent(holding.gainLossPercentage)}
                      </span>
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