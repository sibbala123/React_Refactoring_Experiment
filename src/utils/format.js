export function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export function badgeColor(status) {
  if (status === 'Ready') return '#1d8348'
  if (status === 'Draft') return '#af601a'
  if (status === 'Blocked') return '#b03a2e'
  return '#4d5656'
}
