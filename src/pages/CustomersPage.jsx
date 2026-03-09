import { useMemo, useState } from 'react'
import CustomerList from '../components/CustomerList'
import Toolbar from '../components/Toolbar'
import { CUSTOMERS } from '../data/mockData'

export const basePanelStyle = (isLight, options = {}) => {
  const { borderColor, background, padding = 12, marginBottom = 12, ...overrides } = options
  return {
    border: `1px solid ${borderColor ?? (isLight ? '#c8d1db' : '#4b5b6d')}`,
    borderRadius: 10,
    padding,
    background: background ?? (isLight ? '#ffffff' : '#2b3541'),
    marginBottom,
    ...overrides,
  }
}

export const controlButtonStyle = {
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid #99a6b3',
}

export const controlInputStyle = {
  padding: 8,
  borderRadius: 8,
  border: '1px solid #99a6b3',
}

function filterCustomers(customers, query, onlyActive) {
  const normalizedQuery = query.trim().toLowerCase()
  return customers.filter((c) => {
    const matchesQuery =
      c.name.toLowerCase().includes(normalizedQuery) ||
      c.region.toLowerCase().includes(normalizedQuery) ||
      c.tier.toLowerCase().includes(normalizedQuery)
    const matchesActive = onlyActive ? c.active : true
    return matchesQuery && matchesActive
  })
}

export default function CustomersPage({ theme, user }) {
  const isLight = theme === 'light'
  const [query, setQuery] = useState('')
  const [onlyActive, setOnlyActive] = useState(false)
  const [selected, setSelected] = useState(null)
  const [toggled, setToggled] = useState({})

  const results = useMemo(() => filterCustomers(CUSTOMERS, query, onlyActive), [query, onlyActive])

  const handleToggleFlag = (customerId) => {
    setToggled((prev) => ({ ...prev, [customerId]: !prev[customerId] }))
  }

  return (
    <section>
      <Toolbar theme={theme} title="Customers" subtitle={`Review account health for ${user.team}`} />
      <div style={basePanelStyle(isLight, { display: 'flex', flexWrap: 'wrap', gap: 8 })}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search customers..."
          style={{ ...controlInputStyle, minWidth: 240 }}
        />
        <button onClick={() => setOnlyActive((prev) => !prev)} style={controlButtonStyle}>
          Showing: {onlyActive ? 'Active' : 'All'}
        </button>
      </div>

      {selected && (
        <div style={basePanelStyle(isLight)}>
          <strong>Selected:</strong> {selected.name} ({selected.tier}, {selected.region})
          <button
            onClick={() => setSelected(null)}
            style={{ marginLeft: 10, padding: '4px 8px', borderRadius: 8, border: '1px solid #99a6b3' }}
          >
            Clear
          </button>
        </div>
      )}

      <CustomerList
        customers={results}
        showSpend={true}
        showRegion={true}
        showTier={true}
        highlightIfGold={true}
        isCompact={false}
        theme={theme}
        selectedCustomerId={selected?.id ?? null}
        toggledMap={toggled}
        onSelect={setSelected}
        onHover={(name) => console.log('Hover customer', name)}
        onToggle={handleToggleFlag}
        onAlertName={(name) => window.alert(name)}
      />
    </section>
  )
}