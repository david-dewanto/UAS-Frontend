// src/pages/IndividualStockPage.tsx
import { useState, useMemo, useEffect, useRef } from "react";
import { useStockAnalysis, useStockPriceChart } from "@/hooks/useStockAnalysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { companyService } from "@/lib/company";
import { StockAnalysisCard } from "@/components/StockAnalysisCard";
import {
  ChevronsUpDown,
  CheckIcon,
  Search,
  AlertTriangle,
  ShieldCheck,
  ChartBar,
} from "lucide-react";
import { cn, formatCurrency, formatPercent, formatDecimal } from "@/lib/utils";
import {
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type TimeRange = "1M" | "3M" | "6M" | "1Y" | "ALL";

export default function IndividualStockPage() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("6M");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [stockSymbols, setStockSymbols] = useState<string[]>([]);
  const [isLoadingSymbols, setIsLoadingSymbols] = useState(true);

  // Fetch stock symbols
  useEffect(() => {
    const fetchSymbols = async () => {
      setIsLoadingSymbols(true);
      try {
        const response = await companyService.getSymbols();
        setStockSymbols(response.symbols);
      } catch (error) {
        console.error("Error fetching symbols:", error);
      } finally {
        setIsLoadingSymbols(false);
      }
    };
    fetchSymbols();
  }, []);

  // Filter stocks based on search input
  const filteredStocks = useMemo(() => {
    if (searchInput.length < 2) return [];
    return stockSymbols.filter((stock) =>
      stock.toLowerCase().includes(searchInput.toLowerCase())
    );
  }, [stockSymbols, searchInput]);

  // Calculate date range based on selected time range
  const { startDate, endDate } = useMemo(() => {
    const today = new Date();
    let start: Date;

    switch (timeRange) {
      case "1M":
        start = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          today.getDate()
        );
        break;
      case "3M":
        start = new Date(
          today.getFullYear(),
          today.getMonth() - 3,
          today.getDate()
        );
        break;
      case "6M":
        start = new Date(
          today.getFullYear(),
          today.getMonth() - 6,
          today.getDate()
        );
        break;
      case "1Y":
        start = new Date(
          today.getFullYear() - 1,
          today.getMonth(),
          today.getDate()
        );
        break;
      case "ALL":
        start = new Date(
          today.getFullYear() - 3,
          today.getMonth(),
          today.getDate()
        );
        break;
      default:
        start = new Date(
          today.getFullYear(),
          today.getMonth() - 6,
          today.getDate()
        );
    }

    return { startDate: start, endDate: today };
  }, [timeRange]);

  // Fetch stock data
  const { data, isLoading, error } = useStockAnalysis({
    stockSymbol: selectedStock,
    startDate,
    endDate,
  });

  // Get formatted chart data
  const chartData = useStockPriceChart(data);

  // Format dates for chart
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    switch (timeRange) {
      case "1M":
        return date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        });
      case "3M":
      case "6M":
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      default:
        return date.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });
    }
  };

  // Render risk level indicator
  const renderRiskIndicator = (sharpeRatio: number) => {
    if (sharpeRatio >= 1) {
      return (
        <div className="flex items-center gap-1 text-green-500">
          <ShieldCheck className="h-4 w-4" />
          <span>Good</span>
        </div>
      );
    } else if (sharpeRatio >= 0) {
      return (
        <div className="flex items-center gap-1 text-yellow-500">
          <ChartBar className="h-4 w-4" />
          <span>Fair</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 text-red-500">
          <AlertTriangle className="h-4 w-4" />
          <span>Poor</span>
        </div>
      );
    }
  };

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stock Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Analyze individual stocks performance and metrics
        </p>
      </div>

      {/* Stock Search */}
      <Card>
        <CardHeader>
          <CardTitle>Select Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {isLoadingSymbols ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Button
                variant="outline"
                role="combobox"
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  if (!isSearchOpen) {
                    setTimeout(() => {
                      searchInputRef.current?.focus();
                    }, 0);
                  }
                }}
                className={cn(
                  "w-full justify-between",
                  !selectedStock && "text-muted-foreground"
                )}
              >
                {selectedStock || "Search stock..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            )}

            {isSearchOpen && (
              <div className="absolute top-full z-50 mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                <div className="p-0">
                  <div className="flex items-center border-b px-3 pb-2">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                      ref={searchInputRef}
                      className="flex h-10 w-full rounded-md bg-transparent p-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Search stock symbol..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (filteredStocks.length === 1) {
                            setSelectedStock(filteredStocks[0]);
                            setIsSearchOpen(false);
                            setSearchInput("");
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-1">
                    {searchInput.length < 2 ? (
                      <p className="p-2 text-center text-sm text-muted-foreground">
                        Type at least 2 characters to search
                      </p>
                    ) : filteredStocks.length === 0 ? (
                      <p className="p-2 text-center text-sm text-muted-foreground">
                        No stocks found
                      </p>
                    ) : (
                      filteredStocks.map((stock) => (
                        <div
                          key={stock}
                          onClick={() => {
                            setSelectedStock(stock);
                            setIsSearchOpen(false);
                            setSearchInput("");
                          }}
                          className={cn(
                            "flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                            selectedStock === stock &&
                              "bg-accent text-accent-foreground"
                          )}
                        >
                          <CheckIcon
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedStock === stock
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {stock}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {selectedStock ? (
        isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[400px] w-full" />
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <Skeleton className="h-[200px]" />
              <Skeleton className="h-[200px]" />
            </div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : data ? (
          <div className="space-y-6">
            {/* Price Chart */}
            <StockAnalysisCard stockCode={selectedStock} />
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle>Price History</CardTitle>
                  <Tabs
                    value={timeRange}
                    onValueChange={(v) => setTimeRange(v as TimeRange)}
                  >
                    <TabsList>
                      <TabsTrigger value="1M">1M</TabsTrigger>
                      <TabsTrigger value="3M">3M</TabsTrigger>
                      <TabsTrigger value="6M">6M</TabsTrigger>
                      <TabsTrigger value="1Y">1Y</TabsTrigger>
                      <TabsTrigger value="ALL">3Y</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
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
                        yAxisId="price"
                        tickFormatter={formatCurrency}
                        tick={{ fontSize: 12 }}
                        domain={["auto", "auto"]}
                      />
                      <YAxis
                        yAxisId="volume"
                        orientation="right"
                        tickFormatter={(value: number) =>
                          `${(value / 1000).toFixed(1)}M`
                        } // Divide by 1000 to convert thousands to millions
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const dataPoint = payload[0]?.payload;

                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      Date
                                    </span>
                                    <span className="font-bold text-sm">
                                      {new Date(
                                        dataPoint.date
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      Price
                                    </span>
                                    <span className="font-bold text-sm">
                                      {formatCurrency(dataPoint.closing_price)}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      Volume
                                    </span>
                                    <span className="font-bold text-sm">
                                      {(
                                        dataPoint.volume_thousands || 0
                                      ).toFixed(1)}
                                      M
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
                        yAxisId="price"
                        type="monotone"
                        dataKey="price"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Bar
                        yAxisId="volume"
                        dataKey="volume"
                        fill="hsl(var(--muted))"
                        opacity={0.5}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Company Info and Risk Metrics */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.companyInfo ? (
                    <>
                      <div>
                        <h3 className="font-semibold">
                          {data.companyInfo.company_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedStock}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Sector</p>
                          <p className="text-sm text-muted-foreground">
                            {data.companyInfo.sector || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Industry</p>
                          <p className="text-sm text-muted-foreground">
                            {data.companyInfo.industry || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Market Cap</p>
                          <p className="text-sm text-muted-foreground">
                            {data.companyInfo.market_cap
                              ? formatCurrency(data.companyInfo.market_cap)
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      {data.companyInfo.description && (
                        <div>
                          <p className="text-sm font-medium">Description</p>
                          <p className="text-sm text-justify text-muted-foreground">
                            {data.companyInfo.description}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <Alert>
                      <AlertDescription>
                        Unable to fetch company information
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Risk Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.riskMetrics ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Sharpe Ratio</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDecimal(data.riskMetrics.sharpe_ratio)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Risk Level</p>
                          {renderRiskIndicator(data.riskMetrics.sharpe_ratio)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Avg. Annual Return
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatPercent(
                              data.riskMetrics.avg_annual_return * 100
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Return Volatility
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatPercent(
                              data.riskMetrics.return_volatility * 100
                            )}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <Alert>
                      <AlertDescription>
                        Unable to fetch risk metrics
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <p>Select a stock to view analysis</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
