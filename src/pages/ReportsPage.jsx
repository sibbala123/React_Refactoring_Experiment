import { useEffect, useMemo, useState } from 'react'
import ReportRow from '../components/ReportRow'
import Toolbar from '../components/Toolbar'
import { REPORTS } from '../data/mockData'
import { badgeColor } from '../utils/format'

function filterReports(reports, query, status) {
  const normalizedQuery = query.trim().toLowerCase()
  return reports.filter((r) => {
    const matchesQuery =
      r.title.toLowerCase().includes(normalizedQuery) ||
      r.owner.toLowerCase().includes(normalizedQuery) ||
      r.status.toLowerCase().includes(normalizedQuery)
    const matchesStatus = status === 'All' ? true : r.status === status
    return matchesQuery && matchesStatus
  })
}

export default function ReportsPage({ theme, user }) {
  const isLight = theme === 'light'
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [opened, setOpened] = useState(null)
  const [toast, setToast] = useState('')
  const [counter, setCounter] = useState(0)
  const [showHelp, setShowHelp] = useState(false)
  const [pinReady, setPinReady] = useState(false)

  const filtered = useMemo(() => filterReports(REPORTS, query, status), [query, status])
  const readyCount = useMemo(() => REPORTS.filter((r) => r.status === 'Ready').length, [])
  const draftCount = useMemo(() => REPORTS.filter((r) => r.status === 'Draft').length, [])
  const blockedCount = useMemo(() => REPORTS.filter((r) => r.status === 'Blocked').length, [])

  useEffect(() => {
    if (!toast) {
      return undefined
    }
    const id = window.setTimeout(() => setToast(''), 1600)
    return () => window.clearTimeout(id)
  }, [toast])

  const openReport = (report) => {
    setOpened(report)
    setCounter((prev) => prev + 1)
    setToast(`Opened report: ${report.title}`)
  }

  const pinnedReadyReports = pinReady ? REPORTS.filter((r) => r.status === 'Ready') : []

  const panelBorderColor = isLight ? '#c8d1db' : '#4b5b6d'
  const panelBackground = isLight ? '#ffffff' : '#2b3541'
  const searchPanelStyle = {
    border: `1px solid ${panelBorderColor}`,
    borderRadius: 10,
    padding: 12,
    background: panelBackground,
    marginBottom: 12,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  }
  const fieldStyle = { padding: 8, borderRadius: 8, border: '1px solid #99a6b3' }
  const inputStyle = { ...fieldStyle, minWidth: 220 }
  const actionButtonStyle = { padding: '8px 10px', borderRadius: 8, border: '1px solid #99a6b3' }
  const toastStyle = {
    marginBottom: 12,
    border: `1px solid ${isLight ? '#98b6d6' : '#5d83a9'}`,
    borderRadius: 10,
    padding: 10,
    background: isLight ? '#eaf3ff' : '#2f4b67',
  }
  const helpStyle = {
    marginBottom: 12,
    border: `1px dashed ${isLight ? '#7d8d9f' : '#7a8ea3'}`,
    borderRadius: 10,
    padding: 12,
    background: panelBackground,
  }
  const statusStyle = {
    marginBottom: 12,
    border: `1px solid ${panelBorderColor}`,
    borderRadius: 10,
    padding: 12,
    background: panelBackground,
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  }
  const pinnedStyle = {
    marginBottom: 12,
    border: `1px solid ${isLight ? '#b7d8be' : '#55815d'}`,
    borderRadius: 10,
    padding: 12,
    background: isLight ? '#f2fff3' : '#2f4533',
  }
  const pinnedRowStyle = { padding: '6px 0', borderBottom: '1px solid rgba(120,120,120,0.25)' }
  const openedStyle = {
    marginTop: 12,
    border: `1px solid ${panelBorderColor}`,
    borderRadius: 10,
    padding: 12,
    background: panelBackground,
  }
  const showHelpLabel = showHelp ? 'Hide Help' : 'Show Help'
  const pinReadyLabel = pinReady ? 'Unpin Ready' : 'Pin Ready'

  return (
    <section>
      <Toolbar theme={theme} title="Reports" subtitle={`Status board for ${user.role}`} />

      <div style={searchPanelStyle}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search reports..."
          style={inputStyle}
        />

        <select value={status} onChange={(e) => setStatus(e.target.value)} style={fieldStyle}>
          <option>All</option>
          <option>Ready</option>
          <option>Draft</option>
          <option>Blocked</option>
        </select>

        <button onClick={() => setShowHelp((prev) => !prev)} style={actionButtonStyle}>
          {showHelpLabel}
        </button>

        <button onClick={() => setPinReady((prev) => !prev)} style={actionButtonStyle}>
          {pinReadyLabel}
        </button>
      </div>

      {toast && <div style={toastStyle}>{toast}</div>}

      {showHelp && (
        <div style={helpStyle}>
          <strong>Help:</strong> Use search + status to narrow rows. "Open" loads a details panel and increments open count ({counter}).
        </div>
      )}

      <div style={statusStyle}>
        <span style={{ color: badgeColor('Ready') }}>Ready: {readyCount}</span>
        <span style={{ color: badgeColor('Draft') }}>Draft: {draftCount}</span>
        <span style={{ color: badgeColor('Blocked') }}>Blocked: {blockedCount}</span>
      </div>

      {pinReady && (
        <div style={pinnedStyle}>
          <h3 style={{ marginTop: 0 }}>Pinned Ready Reports</h3>
          {pinnedReadyReports.map((report) => (
            <div key={report.id} style={pinnedRowStyle}>
              {report.title} - {report.owner}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gap: 8 }}>
        {filtered.map((report) => (
          <ReportRow key={report.id} report={report} theme={theme} onOpen={openReport} />
        ))}
      </div>

      {opened && (
        <div style={openedStyle}>
          <h3 style={{ marginTop: 0 }}>Open Report</h3>
          <p style={{ margin: '4px 0' }}>Title: {opened.title}</p>
          <p style={{ margin: '4px 0' }}>Owner: {opened.owner}</p>
          <p style={{ margin: '4px 0' }}>Status: {opened.status}</p>
          <p style={{ margin: '4px 0' }}>Updated: {opened.updatedDaysAgo} days ago</p>
          <button onClick={() => setOpened(null)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #99a6b3' }}>
            Close
          </button>
        </div>
      )}
    </section>
  )
}