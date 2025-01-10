import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Plus, ChevronsUpDown, CheckIcon, Search } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

// Helper function to format percentage
const formatPercent = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

// Types for API responses
interface PortfolioRange {
  return_range: {
    min: number;
    max: number;
  };
  volatility_range: {
    min: number;
    max: number;
  };
}

interface PortfolioAllocation {
  stock_code: string;
  weight: number;
}

interface OptimizationResult {
  allocations: PortfolioAllocation[];
  expected_return: number;
  expected_volatility: number;
  sharpe_ratio: number;
  risk_free_rate: number;
  optimization_criteria: "return" | "volatility";
  target_value: number;
}

export default function PortfolioOptimizationPage() {
  // State for selected stocks
  const [selectedStocks, setSelectedStocks] = useState<string[]>(["", ""]);
  const [stockSymbols, setStockSymbols] = useState<string[]>([]);
  const [isLoadingSymbols, setIsLoadingSymbols] = useState(true);
  const searchInputRefs = useRef<{ [key: number]: HTMLInputElement }>({});
  const [comboboxOpen, setComboboxOpen] = useState<{ [key: number]: boolean }>(
    {}
  );

  // State for portfolio ranges and optimization
  const [portfolioRanges, setPortfolioRanges] = useState<PortfolioRange | null>(
    null
  );
  const [isLoadingRanges, setIsLoadingRanges] = useState(false);
  const [optimizationResult, setOptimizationResult] =
    useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for target selection
  const [targetType, setTargetType] = useState<"return" | "volatility">(
    "return"
  );
  const [targetValue, setTargetValue] = useState<number | null>(null);

  // State for search inputs
  const [searchInputs, setSearchInputs] = useState<{ [key: number]: string }>(
    {}
  );

  // Update selected stock
  const updateSelectedStock = (index: number, value: string) => {
    const newStocks = [...selectedStocks];
    newStocks[index] = value;
    setSelectedStocks(newStocks);
    setSearchInputs({ ...searchInputs, [index]: "" });
    setComboboxOpen({ ...comboboxOpen, [index]: false });
  };

  // Filter stocks based on search input for each selector
  const getFilteredStocks = (index: number) => {
    const searchTerm = searchInputs[index] || "";
    if (searchTerm.length < 2) return [];

    // Filter out already selected stocks
    const availableStocks = stockSymbols.filter(
      (stock) =>
        !selectedStocks.includes(stock) || stock === selectedStocks[index]
    );

    return availableStocks.filter((stock) =>
      stock.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Fetch available stock symbols
  useEffect(() => {
    const fetchStockSymbols = async () => {
      try {
        setIsLoadingSymbols(true);
        const { data } = await api.get<{ symbols: string[]; count: number }>(
          "/public/companies/symbols"
        );
        setStockSymbols(data.symbols || []);
      } catch (error) {
        setError("Failed to fetch available stocks");
        console.error("Error fetching stock symbols:", error);
      } finally {
        setIsLoadingSymbols(false);
      }
    };

    fetchStockSymbols();
  }, []);

  // Effect to fetch portfolio ranges
  useEffect(() => {
    const fetchPortfolioRanges = async () => {
      // Only fetch if we have at least 2 valid stocks
      const validStocks = selectedStocks.filter((s) => s.length > 0);
      if (validStocks.length < 2) {
        setPortfolioRanges(null);
        return;
      }

      try {
        setIsLoadingRanges(true);
        setError(null);
        const { data } = await api.post<PortfolioRange>(
          "/secure/portfolio-ranges",
          {
            stock_codes: validStocks,
          }
        );
        setPortfolioRanges(data);

        // Reset target value if it's outside new ranges
        if (targetValue !== null) {
          if (
            targetType === "return" &&
            (targetValue < data.return_range.min ||
              targetValue > data.return_range.max)
          ) {
            setTargetValue(null);
          } else if (
            targetType === "volatility" &&
            (targetValue < data.volatility_range.min ||
              targetValue > data.volatility_range.max)
          ) {
            setTargetValue(null);
          }
        }
      } catch (error) {
        console.error("Error fetching portfolio ranges:", error);
        setError("Failed to fetch portfolio ranges");
        setPortfolioRanges(null);
      } finally {
        setIsLoadingRanges(false);
      }
    };

    fetchPortfolioRanges();
  }, [selectedStocks]);

  // Optimize portfolio function
  const optimizePortfolio = async () => {
    const validStocks = selectedStocks.filter((s) => s.length > 0);
    if (validStocks.length < 2 || !targetValue) return;

    try {
      setIsOptimizing(true);
      setError(null);

      const { data } = await api.post<OptimizationResult>(
        "/secure/optimize-portfolio",
        {
          stock_codes: validStocks,
          [targetType === "return" ? "target_return" : "target_volatility"]:
            targetValue,
        }
      );

      setOptimizationResult(data);
    } catch (error) {
      console.error("Error optimizing portfolio:", error);
      setError("Failed to optimize portfolio");
    } finally {
      setIsOptimizing(false);
    }
  };

  // Add more stock selector (up to 5)
  const addStockSelector = () => {
    if (selectedStocks.length < 5) {
      setSelectedStocks([...selectedStocks, ""]);
    }
  };

  // Remove stock selector
  const removeStockSelector = (index: number) => {
    if (selectedStocks.length > 2) {
      const newStocks = selectedStocks.filter((_, i) => i !== index);
      setSelectedStocks(newStocks);
    }
  };

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Portfolio Optimization
        </h1>
        <p className="text-muted-foreground mt-2">
          Optimize your portfolio allocation based on risk and return targets
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stock Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Stocks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedStocks.map((stock, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="relative flex-1">
                <Button
                  variant="outline"
                  role="combobox"
                  onClick={() => {
                    setComboboxOpen({
                      ...comboboxOpen,
                      [index]: !comboboxOpen[index],
                    });
                    // Focus the input when opening
                    if (!comboboxOpen[index]) {
                      setTimeout(() => {
                        searchInputRefs.current[index]?.focus();
                      }, 0);
                    }
                  }}
                  className={cn(
                    "w-full justify-between",
                    !stock && "text-muted-foreground"
                  )}
                  disabled={isLoadingSymbols}
                >
                  {stock || "Search stock..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>

                {comboboxOpen[index] && (
                  <div className="absolute top-full z-50 mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                    <div className="p-0">
                      <div className="flex items-center border-b px-3 pb-2">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <input
                          ref={(el) =>
                            (searchInputRefs.current[index] =
                              el as HTMLInputElement)
                          }
                          className="flex h-10 w-full rounded-md bg-transparent p-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Search stock symbol..."
                          value={searchInputs[index] || ""}
                          onChange={(e) =>
                            setSearchInputs({
                              ...searchInputs,
                              [index]: e.target.value,
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const filteredStocks = getFilteredStocks(index);
                              if (filteredStocks.length === 1) {
                                updateSelectedStock(index, filteredStocks[0]);
                              }
                            }
                          }}
                        />
                      </div>
                      <div className="max-h-[300px] overflow-y-auto p-1">
                        {isLoadingSymbols ? (
                          <div className="p-2 text-center text-sm text-muted-foreground">
                            Loading stocks...
                          </div>
                        ) : searchInputs[index]?.length < 2 ? (
                          <p className="p-2 text-center text-sm text-muted-foreground">
                            Type at least 2 characters to search
                          </p>
                        ) : getFilteredStocks(index).length === 0 ? (
                          <p className="p-2 text-center text-sm text-muted-foreground">
                            No stocks found
                          </p>
                        ) : (
                          getFilteredStocks(index).map((stock) => (
                            <div
                              key={stock}
                              onClick={() => updateSelectedStock(index, stock)}
                              className={cn(
                                "flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                selectedStocks[index] === stock &&
                                  "bg-accent text-accent-foreground"
                              )}
                            >
                              <CheckIcon
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedStocks[index] === stock
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

              {selectedStocks.length > 2 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeStockSelector(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          {selectedStocks.length < 5 && (
            <Button
              variant="outline"
              className="w-full"
              onClick={addStockSelector}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Stock
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Target Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Target</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Select
                value={targetType}
                onValueChange={(value: "return" | "volatility") => {
                  setTargetType(value);
                  setTargetValue(null);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select target type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="return">Target Return</SelectItem>
                  <SelectItem value="volatility">Target Volatility</SelectItem>
                </SelectContent>
              </Select>

              {isLoadingRanges ? (
                <Skeleton className="h-10 w-[200px]" />
              ) : portfolioRanges ? (
                <div className="text-sm text-muted-foreground">
                  Range:{" "}
                  {formatPercent(
                    targetType === "return"
                      ? portfolioRanges.return_range.min
                      : portfolioRanges.volatility_range.min
                  )}{" "}
                  -{" "}
                  {formatPercent(
                    targetType === "return"
                      ? portfolioRanges.return_range.max
                      : portfolioRanges.volatility_range.max
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Select at least 2 stocks to see available ranges
                </div>
              )}
            </div>

            {portfolioRanges && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="target-slider"
                      className="text-sm font-medium"
                    >
                      Target {targetType === "return" ? "Return" : "Volatility"}
                    </Label>
                    <span className="w-24 rounded-md bg-muted px-2 py-0.5 text-right text-sm text-muted-foreground">
                      {targetValue ? formatPercent(targetValue) : "Not set"}
                    </span>
                  </div>
                  <Slider
                    id="target-slider"
                    disabled={isLoadingRanges}
                    min={
                      targetType === "return"
                        ? portfolioRanges.return_range.min * 100
                        : portfolioRanges.volatility_range.min * 100
                    }
                    max={
                      targetType === "return"
                        ? portfolioRanges.return_range.max * 100
                        : portfolioRanges.volatility_range.max * 100
                    }
                    step={0.1}
                    value={[
                      targetValue
                        ? targetValue * 100
                        : targetType === "return"
                        ? portfolioRanges.return_range.min * 100
                        : portfolioRanges.volatility_range.min * 100,
                    ]}
                    onValueChange={(values) => setTargetValue(values[0] / 100)}
                    className={cn(
                      "w-full",
                      isLoadingRanges && "cursor-not-allowed opacity-50"
                    )}
                  />
                </div>

                <Card className="border-muted-foreground/20">
                  <CardContent className="p-4">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <div className="space-y-1">
                        <p>Min</p>
                        <p className="text-foreground font-medium">
                          {formatPercent(
                            targetType === "return"
                              ? portfolioRanges.return_range.min
                              : portfolioRanges.volatility_range.min
                          )}
                        </p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p>Max</p>
                        <p className="text-foreground font-medium">
                          {formatPercent(
                            targetType === "return"
                              ? portfolioRanges.return_range.max
                              : portfolioRanges.volatility_range.max
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <Button
            className="w-full"
            disabled={
              !portfolioRanges ||
              isLoadingRanges ||
              !targetValue ||
              selectedStocks.filter((s) => s.length > 0).length < 2
            }
            onClick={optimizePortfolio}
          >
            Optimize Portfolio
          </Button>
        </CardContent>
      </Card>

      {/* Optimization Results */}
      {isOptimizing ? (
        <Card>
          <CardContent className="py-6">
            <div className="space-y-4">
              <Skeleton className="h-[400px]" />
              <Skeleton className="h-8 w-[200px]" />
              <Skeleton className="h-[200px]" />
            </div>
          </CardContent>
        </Card>
      ) : (
        optimizationResult && (
          <Card>
            <CardHeader>
              <CardTitle>Optimization Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pie Chart */}
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={optimizationResult.allocations.map((a) => ({
                        name: a.stock_code,
                        value: parseFloat((a.weight * 100).toFixed(1)),
                      }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {optimizationResult.allocations.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Metrics Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border">
                  <div className="text-sm font-medium text-muted-foreground">
                    Expected Return
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {formatPercent(optimizationResult.expected_return)}
                  </div>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="text-sm font-medium text-muted-foreground">
                    Expected Volatility
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {formatPercent(optimizationResult.expected_volatility)}
                  </div>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="text-sm font-medium text-muted-foreground">
                    Sharpe Ratio
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {optimizationResult.sharpe_ratio.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Allocation Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Weight</TableHead>
                      <TableHead className="text-right">Allocation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {optimizationResult.allocations.map((allocation) => (
                      <TableRow key={allocation.stock_code}>
                        <TableCell className="font-medium">
                          {allocation.stock_code}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPercent(allocation.weight)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary rounded-full h-2"
                              style={{ width: `${allocation.weight * 100}%` }}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
