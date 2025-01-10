import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";
import { Transaction, investmentService } from "@/lib/investment";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading: boolean;
  onDelete?: () => void;
  onError?: (error: string) => void;
}

export function TransactionHistory({
  transactions,
  isLoading,
  onDelete,
  onError,
}: TransactionHistoryProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (transactionId: string) => {
    try {
      setDeletingId(transactionId);
      await investmentService.deleteTransaction(transactionId);
      onDelete?.();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      onError?.(error instanceof Error ? error.message : "Failed to delete transaction");
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No transactions found
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>A list of your transactions</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Price Per Share</TableHead>
          <TableHead className="text-right">Total Value</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>
              {format(new Date(transaction.transaction_date), "PPP")}
            </TableCell>
            <TableCell className="capitalize">
              <span
                className={cn(
                  "rounded-full px-2 py-1 text-xs font-medium",
                  transaction.transaction_type === "buy"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                )}
              >
                {transaction.transaction_type}
              </span>
            </TableCell>
            <TableCell className="font-medium">{transaction.stock_code}</TableCell>
            <TableCell className="text-right">{transaction.quantity}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(transaction.price_per_share)}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(transaction.total_value)}
            </TableCell>
            <TableCell>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={deletingId === transaction.id}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this transaction? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(transaction.id)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}