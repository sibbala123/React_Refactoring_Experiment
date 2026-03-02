import { Link } from 'react-router-dom'

export default function NavItem({ to, label, currentPath, theme, user, locale }) {
  const isLight = theme === 'light'
  const isActive = currentPath === to

  return (
    <Link
      to={to}
      style={{
        textDecoration: 'none',
        border: `1px solid ${isActive ? '#3d87db' : isLight ? '#c8d1db' : '#48586a'}`,
        borderRadius: 8,
        padding: '8px 10px',
        background: isActive ? (isLight ? '#e8f2ff' : '#2f4b67') : isLight ? '#ffffff' : '#2b3541',
        color: isLight ? '#1c2630' : '#f2f6fb',
        display: 'block',
      }}
      title={`Visible to role: ${user.role} (${locale})`}
    >
      {label}
    </Link>
  )
}
