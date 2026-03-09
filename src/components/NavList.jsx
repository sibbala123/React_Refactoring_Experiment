import NavItem from './NavItem'

const items = [
  { to: '/', label: 'Home' },
  { to: '/customers', label: 'Customers' },
  { to: '/reports', label: 'Reports' },
]

export default function NavList() {
  return (
    <nav style={{ display: 'grid', gap: 8 }}>
      {items.map((item) => (
        <NavItem key={item.to} to={item.to} label={item.label} />
      ))}
    </nav>
  )
}