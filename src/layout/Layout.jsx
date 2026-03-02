import { Link, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function Layout({ children, theme, user, onToggleTheme }) {
  const isLight = theme === 'light'
  const location = useLocation()
  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/customers', label: 'Customers' },
    { to: '/reports', label: 'Reports' },
  ]
  const quickStats = [
    `Route: ${location.pathname}`,
    `Role: ${user.role}`,
    `Theme: ${theme}`,
  ]

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: isLight ? '#f6f8fb' : '#1f252c',
        color: isLight ? '#17202a' : '#f5f7fa',
        fontFamily: 'Segoe UI, Tahoma, sans-serif',
      }}
    >
      <Sidebar theme={theme} user={user} currentPath={location.pathname} />
      <aside
        style={{
          width: 220,
          padding: 14,
          borderRight: `1px solid ${isLight ? '#c8d1db' : '#3b4958'}`,
          background: isLight ? '#fdfefe' : '#25303a',
        }}
      >
        <h3 style={{ marginTop: 0 }}>Layout Nav Clone</h3>
        <div style={{ display: 'grid', gap: 8, marginBottom: 10 }}>
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              style={{
                textDecoration: 'none',
                border: `1px solid ${location.pathname === item.to ? '#3d87db' : isLight ? '#c8d1db' : '#48586a'}`,
                borderRadius: 8,
                padding: '8px 10px',
                background: location.pathname === item.to ? (isLight ? '#e8f2ff' : '#2f4b67') : isLight ? '#ffffff' : '#2b3541',
                color: isLight ? '#1c2630' : '#f2f6fb',
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div style={{ border: `1px solid ${isLight ? '#c8d1db' : '#48586a'}`, borderRadius: 8, padding: 10 }}>
          {quickStats.map((s) => (
            <div key={s} style={{ marginBottom: 6 }}>{s}</div>
          ))}
        </div>
      </aside>
      <div style={{ flex: 1, padding: 16 }}>
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
            border: `1px solid ${isLight ? '#c8d1db' : '#3b4958'}`,
            borderRadius: 10,
            padding: 12,
            background: isLight ? '#ffffff' : '#2b3541',
          }}
        >
          <div>Signed in as {user.name} ({user.role})</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={onToggleTheme} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #99a6b3' }}>
              Theme: {theme}
            </button>
            <Link to="/" style={{ color: isLight ? '#165fb7' : '#95c4ff' }}>
              Home
            </Link>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  )
}

