import NavItem from './NavItem'

const items = [
  { to: '/', label: 'Home' },
  { to: '/customers', label: 'Customers' },
  { to: '/reports', label: 'Reports' },
]

export default function NavList({ theme, user, currentPath }) {
  return (
    <nav style={{ display: 'grid', gap: 8 }}>
      {items.map((item) => (
        <NavItem key={item.to} to={item.to} label={item.label} currentPath={currentPath} theme={theme} user={user} />
      ))}
    </nav>
  )
}
