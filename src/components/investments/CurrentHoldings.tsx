import { useEffect, useState } from 'react';
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

interface CurrentHoldingsProps {
  transactions: Transaction[];
}

interface HoldingData {
  stockCode: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  totalValue: number;
  totalCost: number;
  gainLoss: number;
  gainLossPercentage: number;
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [holdings, setHoldings] = useState<HoldingData[]>([]);

  // Calculate average cost and total cost for a stock
  const calculateCosts = (stockCode: string, quantity: number) => {
    const stockTransactions = transactions.filter(tx => tx.stock_code === stockCode);
    let totalCost = 0;
    let totalQuantity = 0;

    for (const tx of stockTransactions) {
      if (tx.transaction_type === 'buy') {
        totalCost += tx.total_value;
        totalQuantity += tx.quantity;
      } else {
        // For sells, we'll use FIFO to reduce the cost basis
        const costPerShare = totalCost / totalQuantity;
        totalCost -= costPerShare * tx.quantity;
        totalQuantity -= tx.quantity;
      }
    }

    // Calculate the final average cost for current holdings
    const averageCost = totalCost / quantity;
    return { averageCost, totalCost };
  };

  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const currentHoldings = investmentService.calculateCurrentHoldings(transactions);
        
        // Get latest prices and calculate metrics
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const holdingsData = await Promise.all(
          Object.entries(currentHoldings).map(async ([stockCode, quantity]) => {
            try {
              const priceData = await investmentService.getStockPrice(
                stockCode,
                lastWeek,
                today
              );
              
              const currentPrice = priceData.prices[priceData.prices.length - 1].closing_price;
              const { averageCost, totalCost } = calculateCosts(stockCode, quantity);
              const totalValue = currentPrice * quantity;
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
            } catch (error) {
              console.error(`Error processing ${stockCode}:`, error);
              throw error;
            }
          })
        );

        // Sort by total value descending
        setHoldings(holdingsData.sort((a, b) => b.totalValue - a.totalValue));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch holdings data');
      } finally {
        setIsLoading(false);
      }
    };

    if (transactions.length > 0) {
      fetchHoldings();
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
        {isLoading ? (
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