import { createContext, useContext } from 'react'
import ReportRow from './ReportRow'

const ReportRowContext = createContext({ theme: 'light', onOpen: () => {} })

export function ReportRowProvider({ theme, onOpen, children }) {
  return <ReportRowContext.Provider value={{ theme, onOpen }}>{children}</ReportRowContext.Provider>
}

export default function ReportRows({ reports, theme: themeProp, onOpen: onOpenProp }) {
  const context = useContext(ReportRowContext)
  const theme = themeProp ?? context.theme
  const onOpen = onOpenProp ?? context.onOpen

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {reports.map((report) => (
        <ReportRow key={report.id} report={report} theme={theme} onOpen={onOpen} />
      ))}
    </div>
  )
}