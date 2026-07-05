import { useState } from 'react'
import type { TableInfo } from '../db/database'
import type { UIStrings } from '../i18n'

interface Props {
  schema: TableInfo[]
  dbName: string
  onPickTable: (name: string) => void
  t: UIStrings
}

export default function SchemaSidebar({ schema, dbName, onPickTable, t }: Props) {
  const [open, setOpen] = useState<Set<string>>(
    () => new Set(schema.length > 0 ? [schema[0].name] : []),
  )

  const toggle = (name: string) => {
    setOpen(prev => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  return (
    <aside className="sidebar">
      <div className="dbLabel">{dbName}</div>
      <ul className="tableList">
        {schema.map(table => (
          <li key={table.name} className="tableItem">
            <div className="tableRow">
              <button
                type="button"
                className="tableToggle"
                onClick={() => toggle(table.name)}
                aria-expanded={open.has(table.name)}
              >
                <span className="tableCaret" aria-hidden="true">
                  {open.has(table.name) ? '▾' : '▸'}
                </span>
                <span className="tableName">{table.name}</span>
              </button>
              <button
                type="button"
                className="tableCount"
                onClick={() => onPickTable(table.name)}
                title={`SELECT * FROM ${table.name} LIMIT 10;`}
              >
                {t.rowsBadge(table.rowCount)}
              </button>
            </div>
            {open.has(table.name) && (
              <ul className="colList">
                {table.columns.map(col => (
                  <li key={col.name} className="colRow">
                    <span className="colName">{col.name}</span>
                    <span className="colType">{col.type.toLowerCase()}</span>
                    {col.pk && <span className="badge">pk</span>}
                    {col.fkTable && <span className="badge badgeFk">{`fk → ${col.fkTable}`}</span>}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <p className="sidebarNote">{t.sidebarNote}</p>
    </aside>
  )
}
