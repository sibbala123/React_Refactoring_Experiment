import ReportRow from './ReportRow'

function ReportRowsBody({ reports, theme, onOpen }) {
  return (
    <>
      {reports.map((report) => (
        <ReportRow key={report.id} report={report} theme={theme} onOpen={onOpen} />
      ))}
    </>
  )
}

export default function ReportRows({ reports, theme, onOpen }) {
  return <ReportRowsBody reports={reports} theme={theme} onOpen={onOpen} />
}
