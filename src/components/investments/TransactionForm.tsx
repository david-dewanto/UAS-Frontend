// src/components/TransactionForm.tsx
import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  CheckIcon,
  ChevronsUpDown,
  Loader2,
  Search,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { investmentService } from "@/lib/investment";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface CompanySymbolsResponse {
  symbols: string[];
  count: number;
}

interface TransactionFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// Form validation schema
const formSchema = z.object({
  transaction_type: z.enum(["buy", "sell"]),
  transaction_date: z.date({
    required_error: "A transaction date is required",
  }),
  stock_code: z.string().min(1, "Stock symbol is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

type FormData = z.infer<typeof formSchema>;

export function TransactionForm({ onSuccess, onError }: TransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [stockSymbols, setStockSymbols] = useState<string[]>([]);
  const [isLoadingSymbols, setIsLoadingSymbols] = useState(true);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transaction_type: "buy",
      quantity: 1,
    },
  });

  // Fetch available stock symbols
  useEffect(() => {
    const fetchStockSymbols = async () => {
      try {
        setIsLoadingSymbols(true);
        const { data } = await api.get<CompanySymbolsResponse>(
          "/public/companies/symbols"
        );
        setStockSymbols(data.symbols || []);
      } catch (error) {
        console.error("Error fetching stock symbols:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch available stocks",
        });
        setStockSymbols([]);
      } finally {
        setIsLoadingSymbols(false);
      }
    };

    fetchStockSymbols();
  }, [toast]);

  // Filter stocks based on search input
  const filteredStocks = useMemo(() => {
    const searchTerm = form.watch("stock_code") || "";
    if (searchTerm.length < 2) return [];
    return stockSymbols.filter((stock) =>
      stock.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stockSymbols, form.watch("stock_code")]);

  if (isLoadingSymbols) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  // Validate sell transaction
  const validateSellTransaction = async (values: FormData) => {
    if (values.transaction_type === "sell") {
      try {
        const transactions = await investmentService.listTransactions();
        const pastTransactions = transactions.filter(
          (tx) => new Date(tx.transaction_date) <= values.transaction_date
        );

        const holdings =
          investmentService.calculateCurrentHoldings(pastTransactions);
        const availableQuantity = holdings[values.stock_code] || 0;

        if (availableQuantity < values.quantity) {
          throw new Error(
            `Insufficient stock quantity. Available: ${availableQuantity}`
          );
        }
      } catch (error) {
        throw new Error(
          error instanceof Error
            ? error.message
            : "Failed to validate sell transaction"
        );
      }
    }
  };

  // Form submission handler
  const onSubmit = async (values: FormData) => {
    try {
      setIsLoading(true);
      await validateSellTransaction(values);

      await investmentService.createTransaction({
        stock_code: values.stock_code,
        transaction_type: values.transaction_type,
        quantity: values.quantity,
        transaction_date: values.transaction_date,
      });

      toast({
        title: "Success",
        description: "Transaction added successfully",
        className: "bg-[hsl(142,76%,36%)] text-white border-0",
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error creating transaction:", error);

      // Handle specific error cases
      let errorMessage = "Failed to create transaction";
      if (error instanceof Error) {
        if (error.message.includes("No data found for stock")) {
          errorMessage =
            "Please select a valid trading date. The selected date might be a holiday or outside the trading period.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });

      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Transaction Type */}
        <FormField
          control={form.control}
          name="transaction_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Transaction Date */}
        <FormField
          control={form.control}
          name="transaction_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Transaction Date</FormLabel>
              <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isLoading}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date);
                      setDatePopoverOpen(false);
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("2000-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Stock Symbol */}
        <FormField
          control={form.control}
          name="stock_code"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Stock Symbol</FormLabel>
              <div className="relative">
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    onClick={() => {
                      setComboboxOpen(!comboboxOpen);
                      if (!comboboxOpen) {
                        setTimeout(() => {
                          searchInputRef.current?.focus();
                        }, 0);
                      }
                    }}
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    {field.value || "Search stock..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>

                {comboboxOpen && (
                  <div className="absolute top-full z-50 mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                    <div className="p-0">
                      {stockSymbols === null ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                          Loading stocks...
                        </div>
                      ) : (
                        <div className="max-h-[300px] overflow-y-auto">
                          <div
                            className="border-input flex items-center border-b px-3"
                            cmdk-input-wrapper=""
                          >
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <input
                              ref={searchInputRef}
                              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Search stock..."
                              value={field.value}
                              onChange={(e) => {
                                form.setValue("stock_code", e.target.value, {
                                  shouldValidate: false,
                                });
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  if (filteredStocks.length === 1) {
                                    form.setValue(
                                      "stock_code",
                                      filteredStocks[0]
                                    );
                                    setComboboxOpen(false);
                                  }
                                }
                              }}
                            />
                          </div>
                          <div className="p-1">
                            {field.value?.length < 2 ? (
                              <div className="py-6 text-center text-sm text-muted-foreground">
                                Type at least 2 characters to search
                              </div>
                            ) : filteredStocks.length === 0 ? (
                              <div className="py-6 text-center text-sm text-muted-foreground">
                                No matching stocks found
                              </div>
                            ) : (
                              filteredStocks.map((stock) => (
                                <div
                                  key={stock}
                                  onClick={() => {
                                    form.setValue("stock_code", stock);
                                    setComboboxOpen(false);
                                  }}
                                  className={cn(
                                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                    field.value === stock &&
                                      "bg-accent text-accent-foreground"
                                  )}
                                >
                                  <CheckIcon
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === stock
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
                      )}
                    </div>
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Quantity */}
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <input
                  type="number"
                  min="1"
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isLoading}
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Processing..." : "Add Transaction"}
        </Button>
      </form>
    </Form>
  );
}
