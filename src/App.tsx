// src/App.tsx
import { Routes, Route, Outlet } from 'react-router-dom'
import InvestmentsDashboardPage from './pages/InvestmentDashboardPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import APIKeys from './components/developer/api-keys'
import AuthDocumentation from './components/developer/docs/auth'
import EmailDocumentation from './components/developer/docs/email'
import CompaniesDocumentation from './components/developer/docs/companies'
import IndividualStocksDocumentation from './components/developer/docs/individual_stocks'
import PortfolioDocumentation from './components/developer/docs/portfolio'
import QuickStart from './components/developer/quick-start'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />}>
        <Route path="investments" element={<Outlet />}>  {/* Changed this line */}
          <Route path="dashboard" element={<InvestmentsDashboardPage />} />
        </Route>
        <Route path="developer">
          <Route index element={<div>Developer Dashboard</div>} />
          <Route path="quick-start" element={<QuickStart />} />
          <Route path="api-keys" element={<APIKeys />} />
          <Route path="docs">
            <Route index element={<div>API Documentation</div>} />
            <Route path="auth" element={<AuthDocumentation />} />
            <Route path="email" element={<EmailDocumentation />} />
            <Route path="companies" element={<CompaniesDocumentation />} />
            <Route path="stocks" element={<IndividualStocksDocumentation />} />
            <Route path="portfolio" element={<PortfolioDocumentation />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  )
}

export default App