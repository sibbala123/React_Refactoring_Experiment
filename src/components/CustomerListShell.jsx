import CustomerList from './CustomerList'

export default function CustomerListShell({
  data,
  displayOptions,
  handlers,
  customers,
  selectedCustomerId,
  toggledMap,
  theme,
  showSpend,
  showRegion,
  showTier,
  highlightIfGold,
  isCompact,
  onSelect,
  onHover,
  onToggle,
  onAlertName,
}) {
  const resolvedData = {
    customers: data?.customers ?? customers,
    selectedCustomerId: data?.selectedCustomerId ?? selectedCustomerId,
    toggledMap: data?.toggledMap ?? toggledMap,
    theme: data?.theme ?? theme,
  }

  const resolvedDisplayOptions = {
    showSpend: displayOptions?.showSpend ?? showSpend,
    showRegion: displayOptions?.showRegion ?? showRegion,
    showTier: displayOptions?.showTier ?? showTier,
    highlightIfGold: displayOptions?.highlightIfGold ?? highlightIfGold,
    isCompact: displayOptions?.isCompact ?? isCompact,
  }

  const resolvedHandlers = {
    onSelect: handlers?.onSelect ?? onSelect,
    onHover: handlers?.onHover ?? onHover,
    onToggle: handlers?.onToggle ?? onToggle,
    onAlertName: handlers?.onAlertName ?? onAlertName,
  }

  return (
    <CustomerList
      customers={resolvedData.customers}
      showSpend={resolvedDisplayOptions.showSpend}
      showRegion={resolvedDisplayOptions.showRegion}
      showTier={resolvedDisplayOptions.showTier}
      highlightIfGold={resolvedDisplayOptions.highlightIfGold}
      isCompact={resolvedDisplayOptions.isCompact}
      theme={resolvedData.theme}
      selectedCustomerId={resolvedData.selectedCustomerId}
      toggledMap={resolvedData.toggledMap}
      onSelect={resolvedHandlers.onSelect}
      onHover={resolvedHandlers.onHover}
      onToggle={resolvedHandlers.onToggle}
      onAlertName={resolvedHandlers.onAlertName}
    />
  )
}