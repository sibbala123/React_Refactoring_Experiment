import { Link, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function Layout({ children, theme, user, onToggleTheme }) {
  const isLight = theme === 'light'
  const location = useLocation()

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
