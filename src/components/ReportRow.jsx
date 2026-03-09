import { badgeColor } from '../utils/format'
import { ActionButton, CardFrame } from './CustomerCard'

export default function ReportRow({ report, theme, onOpen }) {
  return (
    <CardFrame
      theme={theme}
      style={{
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
      <ActionButton onClick={() => onOpen(report)} padding="6px 10px">
        Open
      </ActionButton>
    </CardFrame>
  )
}
