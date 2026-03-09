import CustomerCard from './CustomerCard'

export default function CustomerList({ customers, display, selection, handlers }) {
  const { selectedCustomerId, toggledMap } = selection

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {customers.map((customer) => (
        <CustomerCard
          key={customer.id}
          customer={customer}
          display={display}
          state={{
            selected: selectedCustomerId === customer.id,
            isToggled: !!toggledMap[customer.id],
          }}
          handlers={handlers}
        />
      ))}
    </div>
  )
}