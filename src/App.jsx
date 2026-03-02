import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './layout/Layout'
import HomePage from './pages/HomePage'
import CustomersPage from './pages/CustomersPage'
import ReportsPage from './pages/ReportsPage'

export default function App() {
  const [theme, setTheme] = useState('light')
  const user = { name: 'Avery Lane', role: 'Manager', team: 'Revenue Ops' }
  const locale = 'en-US'

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <Layout theme={theme} user={user} locale={locale} onToggleTheme={toggleTheme}>
      <Routes>
        <Route path="/" element={<HomePage theme={theme} user={user} locale={locale} />} />
        <Route path="/customers" element={<CustomersPage theme={theme} user={user} locale={locale} />} />
        <Route path="/reports" element={<ReportsPage theme={theme} user={user} locale={locale} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
