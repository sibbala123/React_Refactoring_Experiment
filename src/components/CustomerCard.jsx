import { formatCurrency } from '../utils/format'

export function CardFrame({
  as: Component = 'div',
  theme,
  selected = false,
  highlight = false,
  compact = false,
  style,
  children,
  ...rest
}) {
  const isLight = theme === 'light'
  const baseStyle = {
    border: `1px solid ${selected ? '#3d87db' : isLight ? '#c8d1db' : '#4b5b6d'}`,
    borderRadius: 10,
    padding: compact ? 8 : 12,
    background: highlight ? (isLight ? '#fff8dd' : '#534a26') : isLight ? '#ffffff' : '#2b3541',
  }

  return (
    <Component style={{ ...baseStyle, ...style }} {...rest}>
      {children}
    </Component>
  )
}

export function ActionButton({ onClick, padding = '4px 8px', children }) {
  return (
    <button onClick={onClick} style={{ padding, borderRadius: 8, border: '1px solid #99a6b3' }}>
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
  const shouldHighlight = highlightIfGold && tier === 'Gold'

  return (
    <CardFrame
      as="article"
      theme={theme}
      selected={selected}
      highlight={shouldHighlight}
      compact={isCompact}
      onMouseEnter={() => onHover(name)}
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
        <ActionButton onClick={() => onSelect({ id, name, tier, region, spend, active })}>Select</ActionButton>
        <ActionButton onClick={() => onToggle(id)}>Toggle</ActionButton>
        <ActionButton onClick={() => onAlertName(name)}>Alert Name</ActionButton>
      </div>
    </CardFrame>
  )
}
