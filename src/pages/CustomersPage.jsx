import { useMemo, useState } from 'react'
import CustomerListShell from '../components/CustomerListShell'
import Toolbar from '../components/Toolbar'
import { CUSTOMERS } from '../data/mockData'

const DISPLAY_OPTIONS = {
  showSpend: true,
  showRegion: true,
  showTier: true,
  highlightIfGold: true,
  isCompact: false,
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

  const handleHover = (name) => console.log('Hover customer', name)
  const handleAlertName = (name) => window.alert(name)

  const listData = {
    customers: results,
    selectedCustomerId: selected?.id ?? null,
    toggledMap: toggled,
    theme,
  }

  const listHandlers = {
    onSelect: setSelected,
    onHover: handleHover,
    onToggle: handleToggleFlag,
    onAlertName: handleAlertName,
  }

  return (
    <section>
      <Toolbar theme={theme} title="Customers" subtitle={`Review account health for ${user.team}`} />
      <div
        style={{
          border: `1px solid ${isLight ? '#c8d1db' : '#4b5b6d'}`,
          borderRadius: 10,
          padding: 12,
          background: isLight ? '#ffffff' : '#2b3541',
          marginBottom: 12,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search customers..."
          style={{ padding: 8, minWidth: 240, borderRadius: 8, border: '1px solid #99a6b3' }}
        />
        <button onClick={() => setOnlyActive((prev) => !prev)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #99a6b3' }}>
          Showing: {onlyActive ? 'Active' : 'All'}
        </button>
      </div>

      {selected && (
        <div
          style={{
            border: `1px solid ${isLight ? '#c8d1db' : '#4b5b6d'}`,
            borderRadius: 10,
            padding: 12,
            background: isLight ? '#ffffff' : '#2b3541',
            marginBottom: 12,
          }}
        >
          <strong>Selected:</strong> {selected.name} ({selected.tier}, {selected.region})
          <button
            onClick={() => setSelected(null)}
            style={{ marginLeft: 10, padding: '4px 8px', borderRadius: 8, border: '1px solid #99a6b3' }}
          >
            Clear
          </button>
        </div>
      )}

      <CustomerListShell data={listData} displayOptions={DISPLAY_OPTIONS} handlers={listHandlers} />
    </section>
  )
}