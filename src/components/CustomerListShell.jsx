import CustomerList from './CustomerList'

export default function CustomerListShell({
  customers,
  showSpend,
  showRegion,
  showTier,
  highlightIfGold,
  isCompact,
  theme,
  selectedCustomerId,
  toggledMap,
  onSelect,
  onHover,
  onToggle,
  onAlertName,
}) {
  return (
    <CustomerList
      customers={customers}
      showSpend={showSpend}
      showRegion={showRegion}
      showTier={showTier}
      highlightIfGold={highlightIfGold}
      isCompact={isCompact}
      theme={theme}
      selectedCustomerId={selectedCustomerId}
      toggledMap={toggledMap}
      onSelect={onSelect}
      onHover={onHover}
      onToggle={onToggle}
      onAlertName={onAlertName}
    />
  )
}
