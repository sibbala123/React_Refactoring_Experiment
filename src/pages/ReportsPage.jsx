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
  const [showAudit, setShowAudit] = useState(false)
  const [draftFocus, setDraftFocus] = useState(false)
  const [localNote, setLocalNote] = useState('')

  const filtered = useMemo(() => filterReports(REPORTS, query, draftFocus ? 'Draft' : status), [query, status, draftFocus])
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
          placeholder="Search reports..."
          style={{ padding: 8, minWidth: 220, borderRadius: 8, border: '1px solid #99a6b3' }}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ padding: 8, borderRadius: 8, border: '1px solid #99a6b3' }}
        >
          <option>All</option>
          <option>Ready</option>
          <option>Draft</option>
          <option>Blocked</option>
        </select>

        <button onClick={() => setShowHelp((prev) => !prev)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #99a6b3' }}>
          {showHelp ? 'Hide Help' : 'Show Help'}
        </button>

        <button onClick={() => setPinReady((prev) => !prev)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #99a6b3' }}>
          {pinReady ? 'Unpin Ready' : 'Pin Ready'}
        </button>

        <button onClick={() => setShowAudit((prev) => !prev)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #99a6b3' }}>
          {showAudit ? 'Hide Audit' : 'Show Audit'}
        </button>

        <button onClick={() => setDraftFocus((prev) => !prev)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #99a6b3' }}>
          {draftFocus ? 'All Statuses' : 'Draft Focus'}
        </button>
      </div>

      {toast && (
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
      )}

      {showAudit && (
        <div
          style={{
            marginBottom: 12,
            border: 1px solid ,
            borderRadius: 10,
            padding: 12,
            background: isLight ? '#ffffff' : '#2b3541',
          }}
        >
          <strong>Audit Panel:</strong> Ready reports {REPORTS.filter((r) => r.status === 'Ready').length}, drafts {REPORTS.filter((r) => r.status === 'Draft').length}.
          <div style={{ marginTop: 8 }}>
            <input
              value={localNote}
              onChange={(e) => setLocalNote(e.target.value)}
              placeholder='Local note...'
              style={{ padding: 8, minWidth: 220, borderRadius: 8, border: '1px solid #99a6b3' }}
            />
          </div>
        </div>
      )}

      {showHelp && (
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
      )}

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

      {pinReady && (
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

