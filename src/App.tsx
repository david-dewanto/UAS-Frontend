import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import APIKeys from './components/developer/api-keys'
import APIDocumentation from './components/developer/api-docs'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />}>
        <Route path="investments" element={<div>Investment Monitoring (Coming Soon)</div>} />
        <Route path="developer">
          <Route index element={<div>Developer Dashboard</div>} />
          <Route path="api-keys" element={<APIKeys />} />
          <Route path="docs" element={<APIDocumentation />} />
        </Route>
      </Route>
      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  )
}

export default App