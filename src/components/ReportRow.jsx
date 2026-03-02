function localBadgeColor(status) {
  if (status === 'Ready') return '#1d8348'
  if (status === 'Draft') return '#af601a'
  if (status === 'Blocked') return '#b03a2e'
  return '#4d5656'
}

export default function ReportRow({ report, theme, onOpen }) {
  const isLight = theme === 'light'

  return (
    <div
      style={{
        border: `1px solid ${isLight ? '#c8d1db' : '#4b5b6d'}`,
        borderRadius: 10,
        padding: 12,
        background: isLight ? '#ffffff' : '#2b3541',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <div>
        <strong>{report.title}</strong>
        <div style={{ fontSize: 14, opacity: 0.85 }}>Owner: {report.owner}</div>
        <div style={{ fontSize: 14, color: localBadgeColor(report.status) }}>{report.status}</div>
      </div>
      <button onClick={() => onOpen(report)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #99a6b3' }}>
        Open
      </button>
    </div>
  )
}

