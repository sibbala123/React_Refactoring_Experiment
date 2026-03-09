import { formatCurrency } from '../utils/format'

const baseButtonStyle = {
  borderRadius: 8,
  border: '1px solid #99a6b3',
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

  return (
    <article
      onMouseEnter={() => onHover(name)}
      style={{
        border: `1px solid ${selected ? '#3d87db' : isLight ? '#c8d1db' : '#4b5b6d'}`,
        borderRadius: 10,
        padding: isCompact ? 8 : 12,
        background: shouldHighlight ? (isLight ? '#fff8dd' : '#534a26') : isLight ? '#ffffff' : '#2b3541',
      }}
    >
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
        <ActionButton onClick={() => onSelect({ id, name, tier, region, spend, active })} style={{ padding: '4px 8px' }}>
          Select
        </ActionButton>
        <ActionButton onClick={() => onToggle(id)} style={{ padding: '4px 8px' }}>
          Toggle
        </ActionButton>
        <ActionButton onClick={() => onAlertName(name)} style={{ padding: '4px 8px' }}>
          Alert Name
        </ActionButton>
      </div>
    </article>
  )
}
