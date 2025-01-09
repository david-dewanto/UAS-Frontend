import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, investmentService } from '@/lib/investment';

interface PerformanceChartProps {
  transactions: Transaction[];
}

interface ChartDataPoint {
  date: string;
  value: number;
}

type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function PerformanceChart({ transactions }: PerformanceChartProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('6M');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // Calculate start date and interval based on selected time range
  const { startDate, interval } = useMemo(() => {
    const today = new Date();
    switch (timeRange) {
      case '1M':
        return {
          startDate: new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()),
          interval: 'day'
        };
      case '3M':
        return {
          startDate: new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()),
          interval: 'week'
        };
      case '6M':
        return {
          startDate: new Date(today.getFullYear(), today.getMonth() - 6, today.getDate()),
          interval: 'week'
        };
      case '1Y':
        return {
          startDate: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()),
          interval: 'week'
        };
      case 'ALL':
        const oldestTransaction = transactions.length > 0 
          ? new Date(Math.min(...transactions.map(t => new Date(t.transaction_date).getTime())))
          : new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        const yearDiff = today.getFullYear() - oldestTransaction.getFullYear();
        return {
          startDate: oldestTransaction,
          interval: yearDiff > 1 ? 'month' : 'week'
        };
      default:
        return {
          startDate: new Date(today.getFullYear(), today.getMonth() - 6, today.getDate()),
          interval: 'week'
        };
    }
  }, [timeRange, transactions]);

  useEffect(() => {
    const calculateValues = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (transactions.length === 0) {
          setChartData([]);
          return;
        }

        // Sort transactions by date
        const sortedTransactions = [...transactions].sort(
          (a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
        );

        const endDate = new Date();
        const datePoints: Date[] = [];
        let currentDate = new Date(startDate);

        // Generate date points based on interval
        while (currentDate <= endDate) {
          datePoints.push(new Date(currentDate));
          switch (interval) {
            case 'day':
              currentDate.setDate(currentDate.getDate() + 1);
              break;
            case 'week':
              currentDate.setDate(currentDate.getDate() + 7);
              break;
            case 'month':
              currentDate.setMonth(currentDate.getMonth() + 1);
              break;
          }
        }
        
        // Add the end date if it's not already included
        if (currentDate.getTime() !== endDate.getTime()) {
          datePoints.push(endDate);
        }

        // Calculate portfolio value for each date point
        const portfolioValues = await Promise.all(
          datePoints.map(async (date) => {
            const relevantTransactions = sortedTransactions.filter(
              tx => new Date(tx.transaction_date) <= date
            );

            const holdings = investmentService.calculateCurrentHoldings(relevantTransactions);
            
            let totalValue = 0;
            await Promise.all(
              Object.entries(holdings).map(async ([stockCode, quantity]) => {
                const priceData = await investmentService.getStockPrice(
                  stockCode,
                  new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000),
                  date
                );
                
                if (priceData.prices.length > 0) {
                  const price = priceData.prices[priceData.prices.length - 1].closing_price;
                  totalValue += price * quantity;
                }
              })
            );

            return {
              date: date.toISOString().split('T')[0],
              value: totalValue
            };
          })
        );

        setChartData(portfolioValues);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to calculate portfolio values');
      } finally {
        setIsLoading(false);
      }
    };

    calculateValues();
  }, [transactions, startDate, interval]);

  // Format dates based on interval
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    switch (interval) {
      case 'day':
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      case 'week':
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      case 'month':
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      default:
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Portfolio Performance</CardTitle>
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <TabsList>
              <TabsTrigger value="1M">1M</TabsTrigger>
              <TabsTrigger value="3M">3M</TabsTrigger>
              <TabsTrigger value="6M">6M</TabsTrigger>
              <TabsTrigger value="1Y">1Y</TabsTrigger>
              <TabsTrigger value="ALL">ALL</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : chartData.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        ) : (
        <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={chartData} 
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 12 }}
                  width={100}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0 && payload[0].value != null) {
                      const value = payload[0].value as number;
                      const date = payload[0].payload.date;
                      
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Date
                              </span>
                              <span className="font-bold text-sm">
                                {new Date(date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Value
                              </span>
                              <span className="font-bold text-sm">
                                {formatCurrency(value)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}