import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartLine, TrendingDown, TrendingUp, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useStockTrendAnalysis } from "@/hooks/useStockTrendAnalysis";

interface StockAnalysisCardProps {
  stockCode: string | null;
}

export function StockAnalysisCard({ stockCode }: StockAnalysisCardProps) {
  // Only analyze if we have a stock code
  const stockCodes = useMemo(() => 
    stockCode ? [stockCode] : [], 
    [stockCode]
  );

  const {
    isLoading,
    error,
    getTrendStrength,
    getForecastMetrics
  } = useStockTrendAnalysis(stockCodes);

  // Get analysis data for the selected stock
  const trendStrength = stockCode ? getTrendStrength(stockCode) : null;
  const forecastMetrics = stockCode ? getForecastMetrics(stockCode) : null;

  const formatValue = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "N/A";
    return value.toFixed(2);
  };

  // Render trend indicator based on strength
  const renderTrendIndicator = (strength: number | null | undefined) => {
    if (strength === null || strength === undefined) return null;

    if (strength >= 0.7) {
      return (
        <div className="flex items-center gap-2 text-green-500">
          <TrendingUp className="h-5 w-5" />
          <span>Strong Uptrend</span>
        </div>
      );
    } else if (strength >= 0.3) {
      return (
        <div className="flex items-center gap-2 text-blue-500">
          <ChartLine className="h-5 w-5" />
          <span>Moderate Trend</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 text-red-500">
          <TrendingDown className="h-5 w-5" />
          <span>Weak Trend</span>
        </div>
      );
    }
  };

  if (!stockCode) {
    return null;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Technical Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technical Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
            <Skeleton className="h-4 w-[250px]" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Trend Analysis</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Analysis of price movement patterns and strength</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
                <div className="mt-1">
                  {renderTrendIndicator(trendStrength)}
                  <p className="text-sm text-muted-foreground mt-1">
                    Strength Score: {formatValue(trendStrength)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Forecast Accuracy</p>
                <div className="space-y-1 mt-1">
                  <p className="text-sm text-muted-foreground">
                    MAE: {formatValue(forecastMetrics?.mae)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    RMSE: {formatValue(forecastMetrics?.rmse)}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Analysis Details</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Trend strength indicates the reliability of the current price movement</li>
                <li>MAE (Mean Absolute Error) shows the average forecast deviation</li>
                <li>RMSE (Root Mean Square Error) emphasizes larger forecast errors</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}