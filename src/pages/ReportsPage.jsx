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

function getStatusCounts(reports) {
  return reports.reduce(
    (acc, report) => {
      if (report.status === 'Ready') acc.ready += 1
      if (report.status === 'Draft') acc.draft += 1
      if (report.status === 'Blocked') acc.blocked += 1
      return acc
    },
    { ready: 0, draft: 0, blocked: 0 }
  )
}

function FilterControls({
  isLight,
  query,
  status,
  showHelp,
  pinReady,
  onQueryChange,
  onStatusChange,
  onToggleHelp,
  onTogglePin,
}) {
  return (
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
        onChange={onQueryChange}
        placeholder="Search reports..."
        style={{ padding: 8, minWidth: 220, borderRadius: 8, border: '1px solid #99a6b3' }}
      />

      <select
        value={status}
        onChange={onStatusChange}
        style={{ padding: 8, borderRadius: 8, border: '1px solid #99a6b3' }}
      >
        <option>All</option>
        <option>Ready</option>
        <option>Draft</option>
        <option>Blocked</option>
      </select>

      <button onClick={onToggleHelp} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #99a6b3' }}>
        {showHelp ? 'Hide Help' : 'Show Help'}
      </button>

      <button onClick={onTogglePin} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #99a6b3' }}>
        {pinReady ? 'Unpin Ready' : 'Pin Ready'}
      </button>
    </div>
  )
}

function ToastBanner({ isLight, toast }) {
  if (!toast) {
    return null
  }

  return (
    <div
      style={{
        marginBottom: 12,
        border: `1px solid ${isLight ? '#98b6d6' : '#5d83a9'}`,
        borderRadius: 10,
        padding: 10,
        background: isLight ? '#eaf3ff' : '#2f4b67',
      }}
    >
      {toast}
    </div>
  )
}

function HelpPanel({ isLight, counter }) {
  return (
    <div
      style={{
        marginBottom: 12,
        border: `1px dashed ${isLight ? '#7d8d9f' : '#7a8ea3'}`,
        borderRadius: 10,
        padding: 12,
        background: isLight ? '#ffffff' : '#2b3541',
      }}
    >
      <strong>Help:</strong> Use search + status to narrow rows. "Open" loads a details panel and increments open count ({counter}).
    </div>
  )
}

function StatusSummary({ isLight, readyCount, draftCount, blockedCount }) {
  return (
    <div
      style={{
        marginBottom: 12,
        border: `1px solid ${isLight ? '#c8d1db' : '#4b5b6d'}`,
        borderRadius: 10,
        padding: 12,
        background: isLight ? '#ffffff' : '#2b3541',
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
      }}
    >
      <span style={{ color: badgeColor('Ready') }}>Ready: {readyCount}</span>
      <span style={{ color: badgeColor('Draft') }}>Draft: {draftCount}</span>
      <span style={{ color: badgeColor('Blocked') }}>Blocked: {blockedCount}</span>
    </div>
  )
}

function PinnedReadyPanel({ isLight, reports }) {
  return (
    <div
      style={{
        marginBottom: 12,
        border: `1px solid ${isLight ? '#b7d8be' : '#55815d'}`,
        borderRadius: 10,
        padding: 12,
        background: isLight ? '#f2fff3' : '#2f4533',
      }}
    >
      <h3 style={{ marginTop: 0 }}>Pinned Ready Reports</h3>
      {reports.map((report) => (
        <div key={report.id} style={{ padding: '6px 0', borderBottom: '1px solid rgba(120,120,120,0.25)' }}>
          {report.title} - {report.owner}
        </div>
      ))}
    </div>
  )
}

function ReportList({ reports, theme, onOpen }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {reports.map((report) => (
        <ReportRow key={report.id} report={report} theme={theme} onOpen={onOpen} />
      ))}
    </div>
  )
}

function OpenReportPanel({ isLight, report, onClose }) {
  if (!report) {
    return null
  }

  return (
    <div
      style={{
        marginTop: 12,
        border: `1px solid ${isLight ? '#c8d1db' : '#4b5b6d'}`,
        borderRadius: 10,
        padding: 12,
        background: isLight ? '#ffffff' : '#2b3541',
      }}
    >
      <h3 style={{ marginTop: 0 }}>Open Report</h3>
      <p style={{ margin: '4px 0' }}>Title: {report.title}</p>
      <p style={{ margin: '4px 0' }}>Owner: {report.owner}</p>
      <p style={{ margin: '4px 0' }}>Status: {report.status}</p>
      <p style={{ margin: '4px 0' }}>Updated: {report.updatedDaysAgo} days ago</p>
      <button onClick={onClose} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #99a6b3' }}>
        Close
      </button>
    </div>
  )
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
  const statusCounts = useMemo(() => getStatusCounts(REPORTS), [])

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

      <FilterControls
        isLight={isLight}
        query={query}
        status={status}
        showHelp={showHelp}
        pinReady={pinReady}
        onQueryChange={(e) => setQuery(e.target.value)}
        onStatusChange={(e) => setStatus(e.target.value)}
        onToggleHelp={() => setShowHelp((prev) => !prev)}
        onTogglePin={() => setPinReady((prev) => !prev)}
      />

      <ToastBanner isLight={isLight} toast={toast} />

      {showHelp && <HelpPanel isLight={isLight} counter={counter} />}

      <StatusSummary
        isLight={isLight}
        readyCount={statusCounts.ready}
        draftCount={statusCounts.draft}
        blockedCount={statusCounts.blocked}
      />

      {pinReady && <PinnedReadyPanel isLight={isLight} reports={pinnedReadyReports} />}

      <ReportList reports={filtered} theme={theme} onOpen={openReport} />

      <OpenReportPanel isLight={isLight} report={opened} onClose={() => setOpened(null)} />
    </section>
  )
}