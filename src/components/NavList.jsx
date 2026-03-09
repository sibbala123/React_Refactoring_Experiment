import { createContext, useMemo } from 'react'
import NavItem from './NavItem'

const items = [
  { to: '/', label: 'Home' },
  { to: '/customers', label: 'Customers' },
  { to: '/reports', label: 'Reports' },
]

export const NavListContext = createContext({
  theme: null,
  user: null,
  currentPath: '',
})

export default function NavList({ theme, user, currentPath }) {
  const contextValue = useMemo(() => ({ theme, user, currentPath }), [theme, user, currentPath])

  return (
    <NavListContext.Provider value={contextValue}>
      <nav style={{ display: 'grid', gap: 8 }}>
        {items.map((item) => (
          <NavItem key={item.to} to={item.to} label={item.label} currentPath={currentPath} />
        ))}
      </nav>
    </NavListContext.Provider>
  )
}