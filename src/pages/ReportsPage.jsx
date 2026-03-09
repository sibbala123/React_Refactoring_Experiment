import { useEffect, useMemo, useState } from 'react'
import ReportRow from '../components/ReportRow'
import Toolbar from '../components/Toolbar'
import { REPORTS } from '../data/mockData'
import { badgeColor } from '../utils/format'
import { basePanelStyle, controlButtonStyle, controlInputStyle } from './CustomersPage'

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

  return (
    <section>
      <Toolbar theme={theme} title="Reports" subtitle={`Status board for ${user.role}`} />

      <div style={basePanelStyle(isLight, { display: 'flex', flexWrap: 'wrap', gap: 8 })}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search reports..."
          style={{ ...controlInputStyle, minWidth: 220 }}
        />

        <select value={status} onChange={(e) => setStatus(e.target.value)} style={controlInputStyle}>
          <option>All</option>
          <option>Ready</option>
          <option>Draft</option>
          <option>Blocked</option>
        </select>

        <button onClick={() => setShowHelp((prev) => !prev)} style={controlButtonStyle}>
          {showHelp ? 'Hide Help' : 'Show Help'}
        </button>

        <button onClick={() => setPinReady((prev) => !prev)} style={controlButtonStyle}>
          {pinReady ? 'Unpin Ready' : 'Pin Ready'}
        </button>
      </div>

      {toast && (
        <div
          style={basePanelStyle(isLight, {
            borderColor: isLight ? '#98b6d6' : '#5d83a9',
            background: isLight ? '#eaf3ff' : '#2f4b67',
            padding: 10,
          })}
        >
          {toast}
        </div>
      )}

      {showHelp && (
        <div
          style={basePanelStyle(isLight, {
            border: `1px dashed ${isLight ? '#7d8d9f' : '#7a8ea3'}`,
          })}
        >
          <strong>Help:</strong> Use search + status to narrow rows. "Open" loads a details panel and increments open count ({counter}).
        </div>
      )}

      <div style={basePanelStyle(isLight, { display: 'flex', gap: 8, flexWrap: 'wrap' })}>
        <span style={{ color: badgeColor('Ready') }}>Ready: {readyCount}</span>
        <span style={{ color: badgeColor('Draft') }}>Draft: {draftCount}</span>
        <span style={{ color: badgeColor('Blocked') }}>Blocked: {blockedCount}</span>
      </div>

      {pinReady && (
        <div
          style={basePanelStyle(isLight, {
            borderColor: isLight ? '#b7d8be' : '#55815d',
            background: isLight ? '#f2fff3' : '#2f4533',
          })}
        >
          <h3 style={{ marginTop: 0 }}>Pinned Ready Reports</h3>
          {pinnedReadyReports.map((report) => (
            <div key={report.id} style={{ padding: '6px 0', borderBottom: '1px solid rgba(120,120,120,0.25)' }}>
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
        <div style={basePanelStyle(isLight, { marginTop: 12, marginBottom: 0 })}>
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