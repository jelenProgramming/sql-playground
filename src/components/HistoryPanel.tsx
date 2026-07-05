import { truncate } from '../lib/format'

interface Props {
  history: string[]
  onPick: (sql: string) => void
  title: string
}

export default function HistoryPanel({ history, onPick, title }: Props) {
  if (history.length === 0) return null

  return (
    <details className="historyBlock">
      <summary>
        {title} ({history.length})
      </summary>
      <ul className="historyList">
        {history.map((sql, i) => (
          <li key={`${i}-${sql.slice(0, 20)}`}>
            <button type="button" className="historyItem" onClick={() => onPick(sql)}>
              {truncate(sql, 90)}
            </button>
          </li>
        ))}
      </ul>
    </details>
  )
}
