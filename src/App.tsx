import { Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Toaster } from "@/components/ui/toaster";
import InvestmentsDashboardPage from "./pages/InvestmentDashboardPage";
import AddInvestmentPage from "./pages/AddInvestmentPage";
import LandingPage from "./pages/LandingPage";
import IndividualStockPage from "./pages/IndividualStockPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import APIKeys from "./components/developer/api-keys";
import AuthDocumentation from "./components/developer/docs/auth";
import EmailDocumentation from "./components/developer/docs/email";
import CompaniesDocumentation from "./components/developer/docs/companies";
import IndividualStocksDocumentation from "./components/developer/docs/individual_stocks";
import PortfolioDocumentation from "./components/developer/docs/portfolio";
import PortfolioOptimizationPage from "./pages/PortfolioOptimizationPage";
import QuickStart from "./components/developer/quick-start";
import "./App.css";

// Protected Dashboard Route wrapper
function ProtectedDashboard() {
  return (
    <RequireAuth>
      <DashboardPage />
    </RequireAuth>
  );
}

// Protected Investment Routes wrapper
function ProtectedInvestments() {
  return (
    <RequireAuth>
      <Outlet />
    </RequireAuth>
  );
}

// Protected Developer Routes wrapper
function ProtectedDeveloper() {
  return (
    <RequireAuth>
      <Outlet />
    </RequireAuth>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<ProtectedDashboard />}>
          {/* Investment Routes */}
          <Route path="investments" element={<ProtectedInvestments />}>
            <Route path="dashboard" element={<InvestmentsDashboardPage />} />
            <Route path="add-investment" element={<AddInvestmentPage />} />
            <Route path="stocks-analysis" element={<IndividualStockPage />} />
            <Route path="portfolio-analysis" element={<PortfolioOptimizationPage />} />
          </Route>

          {/* Developer Routes */}
          <Route path="developer" element={<ProtectedDeveloper />}>
            <Route index element={<div>Developer Dashboard</div>} />
            <Route path="quick-start" element={<QuickStart />} />
            <Route path="api-keys" element={<APIKeys />} />
            <Route path="docs">
              <Route index element={<div>API Documentation</div>} />
              <Route path="auth" element={<AuthDocumentation />} />
              <Route path="email" element={<EmailDocumentation />} />
              <Route path="companies" element={<CompaniesDocumentation />} />
              <Route
                path="stocks"
                element={<IndividualStocksDocumentation />}
              />
              <Route path="portfolio" element={<PortfolioDocumentation />} />
            </Route>
          </Route>
        </Route>

        {/* 404 Route */}
        <Route path="*" element={
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold">404</h1>
              <p className="mt-2 text-muted-foreground">Page not found</p>
            </div>
          </div>
        } />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;