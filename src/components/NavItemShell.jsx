import NavItem from './NavItem'

export default function NavItemShell({ to, label, currentPath, theme, user }) {
  return <NavItem to={to} label={label} currentPath={currentPath} theme={theme} user={user} />
}
