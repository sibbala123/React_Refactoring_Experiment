import CustomerCard from './CustomerCard'

export default function CustomerList({
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
    <div style={{ display: 'grid', gap: 10 }}>
      {customers.map((customer) => (
        <CustomerCard
          key={customer.id}
          id={customer.id}
          name={customer.name}
          tier={customer.tier}
          region={customer.region}
          spend={customer.spend}
          active={customer.active}
          showSpend={showSpend}
          showRegion={showRegion}
          showTier={showTier}
          highlightIfGold={highlightIfGold}
          isCompact={isCompact}
          theme={theme}
          selected={selectedCustomerId === customer.id}
          isToggled={!!toggledMap[customer.id]}
          onSelect={onSelect}
          onHover={onHover}
          onToggle={onToggle}
          onAlertName={onAlertName}
        />
      ))}
    </div>
  )
}
