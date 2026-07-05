import type { QueryResult } from '../db/database'
import { displayCell, formatMs } from '../lib/format'

const MAX_ROWS = 500

interface Props {
  result: QueryResult | null
}

export default function ResultsTable({ result }: Props) {
  if (result === null) {
    return <p className="placeholder">Run a query to see results here.</p>
  }

  if (result.kind === 'error') {
    return (
      <div className="errorBox" role="alert">
        <span className="errorTag">SQL error</span>
        <code>{result.message}</code>
      </div>
    )
  }

  if (result.kind === 'write') {
    return (
      <div className="writeBox" role="status">
        OK. {result.rowsModified} row(s) modified in {formatMs(result.ms)}.
      </div>
    )
  }

  const shown = result.values.slice(0, MAX_ROWS)

  return (
    <div className="resultBlock">
      <div className="metaRow">
        <div className="metaCell">
          <span className="metaValue">{result.values.length}</span>
          <span className="metaLabel">rows</span>
        </div>
        <div className="metaCell">
          <span className="metaValue">{result.columns.length}</span>
          <span className="metaLabel">columns</span>
        </div>
        <div className="metaCell">
          <span className="metaValue">{formatMs(result.ms)}</span>
          <span className="metaLabel">execution</span>
        </div>
      </div>
      {result.columns.length > 0 && (
        <div className="resultsWrap">
          <table className="results">
            <thead>
              <tr>
                {result.columns.map((col, i) => (
                  <th key={`${col}-${i}`}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className={cell === null ? 'nullCell' : undefined}>
                      {displayCell(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {result.values.length > MAX_ROWS && (
        <p className="truncNote">
          Showing the first {MAX_ROWS} of {result.values.length} rows.
        </p>
      )}
    </div>
  )
}
