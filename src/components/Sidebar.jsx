import NavList from './NavList'

export default function Sidebar({ theme, user, locale, currentPath }) {
  const isLight = theme === 'light'

  return (
    <aside
      style={{
        width: 230,
        padding: 14,
        borderRight: `1px solid ${isLight ? '#c8d1db' : '#3b4958'}`,
        background: isLight ? '#ffffff' : '#26303a',
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 18 }}>Page Truth</h2>
      <NavList theme={theme} user={user} locale={locale} currentPath={currentPath} />
    </aside>
  )
}
