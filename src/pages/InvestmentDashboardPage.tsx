import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { investmentService, Transaction } from '@/lib/investment';
import { authService } from '@/lib/auth';
import { PortfolioSummary } from '@/components/investments/PortfolioSummary';
import { PerformanceChart } from '@/components/investments/PerformanceChart';
import { CurrentHoldings } from '@/components/investments/CurrentHoldings';
import { ReturnMetrics } from '@/components/investments/ReturnMetrics';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';

export default function InvestmentsDashboardPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Fetch user's transactions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = authService.getCurrentUser();
        if (!user) {
          navigate('/login');
          return;
        }

        setIsLoading(true);
        setError(null);
        
        // Fetch transactions
        const userTransactions = await investmentService.listTransactions();
        setTransactions(userTransactions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Calculate current holdings
  const holdings = investmentService.calculateCurrentHoldings(transactions);
  const hasHoldings = Object.keys(holdings).length > 0;

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Investment Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track and analyze your investment portfolio
        </p>
      </div>
  
      {error ? (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      ) : isLoading ? (
        <div className="grid gap-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-[150px]" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-7 w-[120px]" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : !hasHoldings ? (
        <Card className="p-8 text-center">
          <p className="text-lg text-muted-foreground">
            You don't have any active investments yet.
          </p>
          <p className="mt-2">
            Start by adding your first investment transaction.
          </p>
        </Card>
      ) : (
        <div className="grid gap-8">
          <PortfolioSummary transactions={transactions} />
          <PerformanceChart transactions={transactions} />
          <CurrentHoldings transactions={transactions} />
          <ReturnMetrics transactions={transactions} />
        </div>
      )}
    </div>
  );
}