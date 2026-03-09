import { formatCurrency } from '../utils/format'

const baseButtonStyle = {
  borderRadius: 8,
  border: '1px solid #99a6b3',
}

const actionButtonStyle = { padding: '4px 8px' }

export function getSurfaceStyle({ isLight, selected = false, padding = 12, highlight = false }) {
  return {
    border: `1px solid ${selected ? '#3d87db' : isLight ? '#c8d1db' : '#4b5b6d'}`,
    borderRadius: 10,
    padding,
    background: highlight ? (isLight ? '#fff8dd' : '#534a26') : isLight ? '#ffffff' : '#2b3541',
  }
}

export function ActionButton({ onClick, children, style }) {
  return (
    <button onClick={onClick} style={{ ...baseButtonStyle, ...style }}>
      {children}
    </button>
  )
}

export default function CustomerCard({
  id,
  name,
  tier,
  region,
  spend,
  active,
  showSpend,
  showRegion,
  showTier,
  highlightIfGold,
  isCompact,
  theme,
  selected,
  isToggled,
  onSelect,
  onHover,
  onToggle,
  onAlertName,
}) {
  const isLight = theme === 'light'
  const shouldHighlight = highlightIfGold && tier === 'Gold'
  const surfaceStyle = getSurfaceStyle({
    isLight,
    selected,
    padding: isCompact ? 8 : 12,
    highlight: shouldHighlight,
  })

  return (
    <article onMouseEnter={() => onHover(name)} style={surfaceStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <strong>{name}</strong>
        <span>{active ? 'Active' : 'Inactive'}</span>
      </div>

      <div style={{ marginTop: 6, fontSize: 14 }}>
        {showTier && <div>Tier: {tier}</div>}
        {showRegion && <div>Region: {region}</div>}
        {showSpend && <div>Spend: {formatCurrency(spend)}</div>}
        <div>Toggled: {isToggled ? 'On' : 'Off'}</div>
      </div>

      <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <ActionButton onClick={() => onSelect({ id, name, tier, region, spend, active })} style={actionButtonStyle}>
          Select
        </ActionButton>
        <ActionButton onClick={() => onToggle(id)} style={actionButtonStyle}>
          Toggle
        </ActionButton>
        <ActionButton onClick={() => onAlertName(name)} style={actionButtonStyle}>
          Alert Name
        </ActionButton>
      </div>
    </article>
  )
}