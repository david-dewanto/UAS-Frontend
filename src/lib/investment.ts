import api from './api';

// Types for Transactions
export interface Transaction {
  id: string;
  uid: string;
  stock_code: string;
  transaction_type: 'buy' | 'sell';
  quantity: number;
  price_per_share: number;
  total_value: number;
  transaction_date: Date;
}

export interface TransactionCreate {
  stock_code: string;
  transaction_type: 'buy' | 'sell';
  quantity: number;
  transaction_date: Date;
  token: string;  // ID token for auth
}

export interface TransactionList {
  token: string;  // ID token for auth
}

export interface TransactionListResponse {
  transactions: Transaction[];
}

export interface TransactionDelete {
  token: string;  // ID token for auth
}

// Types for Portfolio Returns
export interface ReturnCalculationTransaction {
  stock_code: string;
  transaction_type: 'buy' | 'sell';
  quantity: number;
  price_per_share: number;
  total_value: number;
  transaction_date: Date;
}

export interface PortfolioReturnRequest {
  transactions: ReturnCalculationTransaction[];
}

export interface StockReturn {
  twr: number;  // Time-weighted return
  mwr: number;  // Money-weighted return
}

export interface PortfolioReturnResponse {
  portfolio_twr: number;
  portfolio_mwr: number;
  calculation_date: Date;
  start_date: Date;
  end_date: Date;
  stock_breakdown: {
    [key: string]: StockReturn;
  };
}

// Types for Portfolio Optimization
export interface PortfolioOptimizationRequest {
  stock_codes: string[];
  target_return?: number;
  target_volatility?: number;
}

export interface PortfolioAllocation {
  stock_code: string;
  weight: number;
}

export interface PortfolioOptimizationResponse {
  allocations: PortfolioAllocation[];
  expected_return: number;
  expected_volatility: number;
  sharpe_ratio: number;
  risk_free_rate: number;
  optimization_criteria: 'return' | 'volatility';
  target_value: number;
}

// Types for Range Analysis
export interface FeasibleRangeRequest {
  stock_codes: string[];
}

export interface RangeValues {
  min: number;
  max: number;
}

export interface FeasibleRangeResponse {
  return_range: RangeValues;
  volatility_range: RangeValues;
}

// Types for Sharpe Ratio
export interface SharpeRatioResponse {
  stock_code: string;
  sharpe_ratio: number;
  avg_annual_return: number;
  return_volatility: number;
  risk_free_rate: number;
}

// Types for Stock Prices
export interface StockPriceData {
  date: Date;
  closing_price: number;
  volume_thousands: number;
}

export interface StockPriceResponse {
  symbol: string;
  prices: StockPriceData[];
}

// Investment API Service
export const investmentService = {
  // Transaction Management
  listTransactions: async (): Promise<Transaction[]> => {
    try {
      const user = localStorage.getItem('user');
      if (!user) throw new Error('User not authenticated');
      
      const { id_token } = JSON.parse(user);
      
      const { data } = await api.post<TransactionListResponse>(
        '/internal/transactions/list',
        { token: id_token }
      );
      
      return data.transactions.map(tx => ({
        ...tx,
        transaction_date: new Date(tx.transaction_date)
      }));
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || 'Failed to fetch transactions');
      }
      throw new Error('Failed to fetch transactions');
    }
  },

  createTransaction: async (transaction: Omit<TransactionCreate, 'token'>): Promise<Transaction> => {
    try {
      const user = localStorage.getItem('user');
      if (!user) throw new Error('User not authenticated');
      
      const { id_token } = JSON.parse(user);
      
      const { data } = await api.post<Transaction>(
        '/internal/transactions',
        { ...transaction, token: id_token }
      );
      
      return {
        ...data,
        transaction_date: new Date(data.transaction_date)
      };
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || 'Failed to create transaction');
      }
      throw new Error('Failed to create transaction');
    }
  },

  deleteTransaction: async (transactionId: string): Promise<void> => {
    try {
      const user = localStorage.getItem('user');
      if (!user) throw new Error('User not authenticated');
      
      const { id_token } = JSON.parse(user);
      
      await api.post(
        `/internal/transactions/delete/${transactionId}`,
        { token: id_token }
      );
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || 'Failed to delete transaction');
      }
      throw new Error('Failed to delete transaction');
    }
  },

  // Portfolio Analysis
  calculateReturns: async (transactions: ReturnCalculationTransaction[]): Promise<PortfolioReturnResponse> => {
    try {
      const { data } = await api.post<PortfolioReturnResponse>(
        '/secure/calculate-portfolio-returns',
        { transactions }
      );
      
      return {
        ...data,
        calculation_date: new Date(data.calculation_date),
        start_date: new Date(data.start_date),
        end_date: new Date(data.end_date)
      };
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || 'Failed to calculate returns');
      }
      throw new Error('Failed to calculate returns');
    }
  },

  getStockPrice: async (stockCode: string, startDate: Date, endDate: Date): Promise<StockPriceResponse> => {
    try {
      const dateRange = `${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}`;
      
      const { data } = await api.get<StockPriceResponse>(
        `/secure/stock-price/${stockCode}/${dateRange}`
      );
      
      return {
        ...data,
        prices: data.prices.map(price => ({
          ...price,
          date: new Date(price.date)
        }))
      };
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || 'Failed to fetch stock price');
      }
      throw new Error('Failed to fetch stock price');
    }
  },

  // Portfolio Optimization and Analysis
  getSharpeRatio: async (stockCode: string): Promise<SharpeRatioResponse> => {
    try {
      const { data } = await api.get<SharpeRatioResponse>(
        `/secure/sharpe-ratio/${stockCode}`
      );
      return data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || 'Failed to calculate Sharpe ratio');
      }
      throw new Error('Failed to calculate Sharpe ratio');
    }
  },

  optimizePortfolio: async (
    request: PortfolioOptimizationRequest
  ): Promise<PortfolioOptimizationResponse> => {
    try {
      // Validate request
      if (request.target_return !== undefined && request.target_volatility !== undefined) {
        throw new Error('Cannot specify both target return and target volatility');
      }
      if (request.target_return === undefined && request.target_volatility === undefined) {
        throw new Error('Must specify either target return or target volatility');
      }
      if (request.stock_codes.length < 2) {
        throw new Error('Minimum 2 stocks required for optimization');
      }
      if (request.stock_codes.length > 5) {
        throw new Error('Maximum 5 stocks allowed for optimization');
      }

      const { data } = await api.post<PortfolioOptimizationResponse>(
        '/secure/optimize-portfolio',
        request
      );
      return data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || 'Failed to optimize portfolio');
      }
      throw new Error('Failed to optimize portfolio');
    }
  },

  getPortfolioRanges: async (stockCodes: string[]): Promise<FeasibleRangeResponse> => {
    try {
      // Validate request
      if (stockCodes.length < 2) {
        throw new Error('Minimum 2 stocks required for range calculation');
      }
      if (stockCodes.length > 5) {
        throw new Error('Maximum 5 stocks allowed for range calculation');
      }

      const { data } = await api.post<FeasibleRangeResponse>(
        '/secure/portfolio-ranges',
        { stock_codes: stockCodes }
      );
      return data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || 'Failed to calculate portfolio ranges');
      }
      throw new Error('Failed to calculate portfolio ranges');
    }
  },

  // Helper function to calculate current holdings from transactions
  calculateCurrentHoldings: (transactions: Transaction[]): { [stockCode: string]: number } => {
    const holdings: { [stockCode: string]: number } = {};
    
    transactions.forEach(tx => {
      if (!holdings[tx.stock_code]) {
        holdings[tx.stock_code] = 0;
      }
      
      holdings[tx.stock_code] += tx.transaction_type === 'buy' 
        ? tx.quantity 
        : -tx.quantity;
    });

    // Remove stocks with zero holdings
    return Object.fromEntries(
      Object.entries(holdings).filter(([_, quantity]) => quantity > 0)
    );
  },
  
  analyzeStocks: async (stockCodes: string[]): Promise<StockAnalysisResponse> => {
    try {
      const { data } = await api.post<StockAnalysisResponse>(
        '/internal/analyze-stocks',
        { stock_codes: stockCodes }
      );
      return data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || 'Failed to analyze stocks');
      }
      throw new Error('Failed to analyze stocks');
    }
  }
};

export interface StockAnalysisRequest {
  stock_codes: string[];
}

export interface StockAnalysisResponse {
  timestamp: string;
  analysis: {
    [key: string]: {  // e.g. category_BBCA
      trend: {
        strength: number;
      };
      forecast: {
        metrics: {
          mae: number;
          rmse: number;
        };
      };
    };
  };
}

