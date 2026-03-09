import Toolbar from '../components/Toolbar'

const tips = [
  { id: 't1', title: 'Search Fast', text: 'Use quick filters to locate records quickly.' },
  { id: 't2', title: 'Pin Priorities', text: 'Pin ready reports when planning weekly reviews.' },
  { id: 't3', title: 'Track Activity', text: 'Toggle active-only views to focus on live accounts.' },
]

export const cardStyle = (isLight, extraStyles = {}) => ({
  border: `1px solid ${isLight ? '#c8d1db' : '#4b5b6d'}`,
  borderRadius: 10,
  padding: 12,
  background: isLight ? '#ffffff' : '#2b3541',
  ...extraStyles,
})

export default function HomePage({ theme, user }) {
  const isLight = theme === 'light'

  return (
    <section>
      <Toolbar theme={theme} title="Home" subtitle={`Welcome back, ${user.name}`} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {tips.map((tip) => (
          <article key={tip.id} style={cardStyle(isLight)}>
            <h3 style={{ marginTop: 0 }}>{tip.title}</h3>
            <p style={{ marginBottom: 0, opacity: 0.9 }}>{tip.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}