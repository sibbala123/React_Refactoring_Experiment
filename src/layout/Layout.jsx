import { Link, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const containerStyle = (isLight) => ({
  display: 'flex',
  minHeight: '100vh',
  background: isLight ? '#f6f8fb' : '#1f252c',
  color: isLight ? '#17202a' : '#f5f7fa',
  fontFamily: 'Segoe UI, Tahoma, sans-serif',
})

const headerStyle = (isLight) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 16,
  border: `1px solid ${isLight ? '#c8d1db' : '#3b4958'}`,
  borderRadius: 10,
  padding: 12,
  background: isLight ? '#ffffff' : '#2b3541',
})

const contentStyle = { flex: 1, padding: 16 }
const headerActionsStyle = { display: 'flex', gap: 8, alignItems: 'center' }
const themeButtonStyle = { padding: '6px 10px', borderRadius: 8, border: '1px solid #99a6b3' }

function LayoutHeader({ user, theme, isLight, onToggleTheme }) {
  return (
    <header style={headerStyle(isLight)}>
      <div>
        Signed in as {user.name} ({user.role})
      </div>
      <div style={headerActionsStyle}>
        <button onClick={onToggleTheme} style={themeButtonStyle}>
          Theme: {theme}
        </button>
        <Link to="/" style={{ color: isLight ? '#165fb7' : '#95c4ff' }}>
          Home
        </Link>
      </div>
    </header>
  )
}

export default function Layout({ children, theme, user, onToggleTheme }) {
  const isLight = theme === 'light'
  const location = useLocation()

  return (
    <div style={containerStyle(isLight)}>
      <Sidebar theme={theme} user={user} currentPath={location.pathname} />
      <div style={contentStyle}>
        <LayoutHeader user={user} theme={theme} isLight={isLight} onToggleTheme={onToggleTheme} />
        <main>{children}</main>
      </div>
    </div>
  )
}