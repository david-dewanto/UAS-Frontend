import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { TransactionForm } from "@/components/investments/TransactionForm";
import { TransactionHistory } from "@/components/investments/TransactionHistory";
import { investmentService, Transaction } from "@/lib/investment";

export default function AddInvestmentPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await investmentService.listTransactions();
      // Sort transactions by date in descending order (newest first)
      setTransactions(data.sort((a, b) => 
        new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
      ));
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err instanceof Error ? err.message : "Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Handle form success
  const handleTransactionSuccess = () => {
    fetchTransactions(); // Refresh transaction list
  };

  // Handle errors
  const handleError = () => {
    setError("Please Enter a Valid Trading Date");
    // Clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Investment</h1>
        <p className="text-muted-foreground mt-2">
          Add a new transaction to your portfolio
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>
              Enter the details of your investment transaction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <TransactionForm 
              onSuccess={handleTransactionSuccess}
              onError={handleError}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              View and manage your previous transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionHistory 
              transactions={transactions}
              isLoading={isLoading}
              onDelete={handleTransactionSuccess}
              onError={handleError}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}