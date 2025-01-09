import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, investmentService } from '@/lib/investment';
import { ProcessedHolding, calculatePortfolioValues } from '@/lib/stockUtils';
import { generateDatePoints, formatCurrency } from '@/lib/utils';
import { useStockPrices } from '@/hooks/useStockPrices';

interface PerformanceChartProps {
  transactions: Transaction[];
}

type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';

export function PerformanceChart({ transactions }: PerformanceChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('6M');

  // Calculate date ranges based on selected time range
  const { startDate, endDate, interval } = useMemo(() => {
    const today = new Date();
    let start: Date;
    let intervalType: "day" | "week" | "month";

    switch (timeRange) {
      case '1M':
        start = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        intervalType = "day";
        break;
      case '3M':
        start = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
        intervalType = "week";
        break;
      case '6M':
        start = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
        intervalType = "week";
        break;
      case '1Y':
        start = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        intervalType = "week";
        break;
      case 'ALL':
        start = transactions.length > 0 
          ? new Date(Math.min(...transactions.map(t => new Date(t.transaction_date).getTime())))
          : new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        intervalType = today.getFullYear() - start.getFullYear() > 1 ? "month" : "week";
        break;
      default:
        start = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
        intervalType = "week";
    }

    return {
      startDate: start,
      endDate: today,
      interval: intervalType
    };
  }, [timeRange, transactions]);

  // Generate target date points for the chart
  const datePoints = useMemo(() => 
    generateDatePoints(startDate, endDate, interval),
    [startDate, endDate, interval]
  );

  // Fetch stock prices using the hook
  const { isLoading, error, stockPrices } = useStockPrices(
    transactions,
    startDate,
    endDate
  );

  // Calculate chart data
  const chartData = useMemo(() => {
    if (isLoading || error || !Object.keys(stockPrices).length) {
      return [];
    }

    // Get current holdings
    const holdings = investmentService.calculateCurrentHoldings(transactions);

    // Process holdings data
    const processedHoldings: ProcessedHolding[] = Object.entries(holdings).map(
      ([stockCode, quantity]) => ({
        stockCode,
        quantity,
        prices: stockPrices[stockCode]?.prices || []
      })
    );

    return calculatePortfolioValues(processedHoldings, datePoints);
  }, [transactions, stockPrices, datePoints, isLoading, error]);

  // Format dates based on interval
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    switch (interval) {
      case "day":
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      case "week":
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      case "month":
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
        ) : error ? (
          <div className="h-[400px] flex items-center justify-center text-destructive">
            {error}
          </div>
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