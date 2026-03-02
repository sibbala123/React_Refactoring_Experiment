export default function ReportRowDetails({
  title,
  owner,
  status,
  updatedDaysAgo,
  theme,
  isOpen,
  showOwner,
  showStatus,
  showUpdated,
  compact,
  pinReady,
  toast,
  counter,
  onClose,
  onPinToggle,
  onEcho,
}) {
  const isLight = theme === 'light'
  if (!isOpen) return null

  return (
    <div
      style={{
        marginTop: 12,
        border: `1px solid ${isLight ? '#c8d1db' : '#4b5b6d'}`,
        borderRadius: 10,
        padding: compact ? 8 : 12,
        background: isLight ? '#ffffff' : '#2b3541',
      }}
    >
      <h3 style={{ marginTop: 0 }}>Open Report</h3>
      <p style={{ margin: '4px 0' }}>Title: {title}</p>
      {showOwner && <p style={{ margin: '4px 0' }}>Owner: {owner}</p>}
      {showStatus && <p style={{ margin: '4px 0' }}>Status: {status}</p>}
      {showUpdated && <p style={{ margin: '4px 0' }}>Updated: {updatedDaysAgo} days ago</p>}
      <p style={{ margin: '4px 0' }}>Open Count: {counter}</p>
      <p style={{ margin: '4px 0' }}>Toast: {toast || 'none'}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onClose} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #99a6b3' }}>
          Close
        </button>
        <button onClick={onPinToggle} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #99a6b3' }}>
          {pinReady ? 'Unpin Ready' : 'Pin Ready'}
        </button>
        <button onClick={onEcho} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #99a6b3' }}>
          Echo
        </button>
      </div>
    </div>
  )
}
