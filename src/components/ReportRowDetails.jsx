import { badgeColor } from '../utils/format'

const DEFAULT_LABELS = {
  title: 'Title',
  owner: 'Owner',
  status: 'Status',
  updated: 'Updated',
}

const DEFAULT_LINE_STYLE = { margin: '4px 0' }
const DEFAULT_BUTTON_STYLE = { padding: '6px 10px', borderRadius: 8, border: '1px solid #99a6b3' }

export default function ReportRowDetails({
  details,
  report,
  ui,
  actions,
  title,
  owner,
  status,
  updatedDaysAgo,
  labelTitle,
  labelOwner,
  labelStatus,
  labelUpdated,
  statusColor,
  colorStatus,
  onClose,
  closeLabel = 'Close',
  showClose,
  lineStyle,
  buttonStyle,
}) {
  const resolvedDetails = details ?? {}
  const resolvedReport = {
    title: report?.title ?? resolvedDetails.report?.title ?? title,
    owner: report?.owner ?? resolvedDetails.report?.owner ?? owner,
    status: report?.status ?? resolvedDetails.report?.status ?? status,
    updatedDaysAgo: report?.updatedDaysAgo ?? resolvedDetails.report?.updatedDaysAgo ?? updatedDaysAgo,
  }

  const hasReport =
    report != null ||
    resolvedDetails.report != null ||
    title != null ||
    owner != null ||
    status != null ||
    updatedDaysAgo != null

  if (!hasReport) {
    return null
  }

  const resolvedUi = ui ?? resolvedDetails.ui ?? {}
  const resolvedActions = actions ?? resolvedDetails.actions ?? {}
  const resolvedLabels = resolvedUi.labels ?? resolvedDetails.labels ?? {}

  const resolvedStatusColor = resolvedUi.statusColor ?? resolvedDetails.statusColor ?? statusColor
  const resolvedColorStatus = resolvedUi.colorStatus ?? resolvedDetails.colorStatus ?? colorStatus
  const shouldColorStatus = resolvedColorStatus ?? (resolvedStatusColor !== undefined && resolvedStatusColor !== null)
  const statusStyle = shouldColorStatus ? { color: resolvedStatusColor ?? badgeColor(resolvedReport.status) } : null

  const resolvedLineStyle = resolvedUi.lineStyle ?? lineStyle ?? DEFAULT_LINE_STYLE
  const resolvedButtonStyle = resolvedUi.buttonStyle ?? buttonStyle ?? DEFAULT_BUTTON_STYLE

  const resolvedCloseLabel = resolvedActions.closeLabel ?? resolvedDetails.closeLabel ?? closeLabel
  const resolvedOnClose = resolvedActions.onClose ?? resolvedDetails.onClose ?? onClose
  const resolvedShowClose =
    resolvedActions.showClose ?? resolvedDetails.showClose ?? showClose ?? Boolean(resolvedOnClose)

  const titleLabel = resolvedLabels.title ?? resolvedUi.labelTitle ?? labelTitle ?? DEFAULT_LABELS.title
  const ownerLabel = resolvedLabels.owner ?? resolvedUi.labelOwner ?? labelOwner ?? DEFAULT_LABELS.owner
  const statusLabel = resolvedLabels.status ?? resolvedUi.labelStatus ?? labelStatus ?? DEFAULT_LABELS.status
  const updatedLabel = resolvedLabels.updated ?? resolvedUi.labelUpdated ?? labelUpdated ?? DEFAULT_LABELS.updated

  const statusContent = statusStyle ? <span style={statusStyle}>{resolvedReport.status}</span> : resolvedReport.status

  return (
    <>
      <p style={resolvedLineStyle}>
        {titleLabel}: {resolvedReport.title}
      </p>
      <p style={resolvedLineStyle}>
        {ownerLabel}: {resolvedReport.owner}
      </p>
      <p style={resolvedLineStyle}>
        {statusLabel}: {statusContent}
      </p>
      <p style={resolvedLineStyle}>
        {updatedLabel}: {resolvedReport.updatedDaysAgo} days ago
      </p>
      {resolvedShowClose && (
        <button onClick={resolvedOnClose} style={resolvedButtonStyle}>
          {resolvedCloseLabel}
        </button>
      )}
    </>
  )
}