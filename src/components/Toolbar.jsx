export default function Toolbar({ theme, title, subtitle }) {
  const isLight = theme === 'light'

  return (
    <div
      style={{
        marginBottom: 12,
        border: `1px solid ${isLight ? '#c8d1db' : '#4b5b6d'}`,
        borderRadius: 10,
        padding: 12,
        background: isLight ? '#ffffff' : '#2b3541',
      }}
    >
      <h1 style={{ margin: 0, fontSize: 20 }}>{title}</h1>
      <p style={{ margin: '6px 0 0 0', opacity: 0.85 }}>{subtitle}</p>
    </div>
  )
}
