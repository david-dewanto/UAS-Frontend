// src/lib/company.ts
import api from './api';
import { SharpeRatioResponse, StockPriceResponse } from '@/lib/investment';

export interface CompanyInfoResponse {
  symbol: string;
  company_name: string | null;
  sector: string | null;
  industry: string | null;
  market_cap: number | null;
  description: string | null;
  last_updated: string;
}

export interface CompanySymbolsResponse {
  symbols: string[];
  count: number;
}

export interface StockAnalysisData {
  companyInfo: CompanyInfoResponse | null;
  priceData: StockPriceResponse | null;
  riskMetrics: SharpeRatioResponse | null;
}

export interface UseStockAnalysisResult {
  data: StockAnalysisData | null;
  isLoading: boolean;
  error: string | null;
}

// Type for the price chart data
export interface StockPriceChartData {
  date: string;
  price: number;
  volume: number;
}

export const companyService = {
  // Get company symbols
  getSymbols: async (): Promise<CompanySymbolsResponse> => {
    try {
      const { data } = await api.get<CompanySymbolsResponse>('/public/companies/symbols');
      return data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || 'Failed to fetch company symbols');
      }
      throw new Error('Failed to fetch company symbols');
    }
  },

  // Get company information
  getCompanyInfo: async (symbol: string): Promise<CompanyInfoResponse> => {
    try {
      const { data } = await api.get<CompanyInfoResponse>(`/public/companies/${symbol}`);
      return data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || 'Failed to fetch company information');
      }
      throw new Error('Failed to fetch company information');
    }
  }
};