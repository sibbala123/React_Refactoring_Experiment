import { formatCurrency } from '../utils/format'

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
  showStatusLabel,
  allowAlertButton,
  allowToggleButton,
  borderStyleMode,
  emphasisLevel,
  onFocusCard,
}) {
  const isLight = theme === 'light'
  const shouldHighlight = highlightIfGold && tier === 'Gold'
  const borderTone = selected ? '#3d87db' : isLight ? '#c8d1db' : '#4b5b6d'

  return (
    <article
      onMouseEnter={() => onHover(name)}
      onFocus={() => onFocusCard(id)}
      style={{
        border: borderStyleMode === 'dashed' ? `1px dashed ${borderTone}` : `1px solid ${borderTone}`,
        borderRadius: 10,
        padding: isCompact ? 8 : 12,
        background: shouldHighlight ? (isLight ? '#fff8dd' : '#534a26') : isLight ? '#ffffff' : '#2b3541',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <strong>{name}</strong>
        <span>{showStatusLabel ? (active ? 'Active' : 'Inactive') : ''}</span>
      </div>

      <div style={{ marginTop: 6, fontSize: 14, opacity: emphasisLevel > 1 ? 1 : 0.9 }}>
        {showTier && <div>Tier: {tier}</div>}
        {showRegion && <div>Region: {region}</div>}
        {showSpend && <div>Spend: {formatCurrency(spend)}</div>}
        <div>Toggled: {isToggled ? 'On' : 'Off'}</div>
      </div>

      <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button onClick={() => onSelect({ id, name, tier, region, spend, active })} style={{ padding: '4px 8px', borderRadius: 8, border: '1px solid #99a6b3' }}>
          Select
        </button>
        {allowToggleButton && (
          <button onClick={() => onToggle(id)} style={{ padding: '4px 8px', borderRadius: 8, border: '1px solid #99a6b3' }}>
            Toggle
          </button>
        )}
        {allowAlertButton && (
          <button onClick={() => onAlertName(name)} style={{ padding: '4px 8px', borderRadius: 8, border: '1px solid #99a6b3' }}>
            Alert Name
          </button>
        )}
      </div>
    </article>
  )
}
