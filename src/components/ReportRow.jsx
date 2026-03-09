import { badgeColor } from '../utils/format'
import { ActionButton, getSurfaceStyle } from './CustomerCard'

export default function ReportRow({ report, theme, onOpen }) {
  const isLight = theme === 'light'
  const surfaceStyle = getSurfaceStyle({ isLight })

  return (
    <div
      style={{
        ...surfaceStyle,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <div>
        <strong>{report.title}</strong>
        <div style={{ fontSize: 14, opacity: 0.85 }}>Owner: {report.owner}</div>
        <div style={{ fontSize: 14, color: badgeColor(report.status) }}>{report.status}</div>
      </div>
      <ActionButton onClick={() => onOpen(report)} style={{ padding: '6px 10px' }}>
        Open
      </ActionButton>
    </div>
  )
}