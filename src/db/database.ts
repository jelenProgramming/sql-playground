import type { Database, SqlJsStatic, SqlValue } from 'sql.js'
import { SEED_SQL } from './seed'

export interface ColumnInfo {
  name: string
  type: string
  pk: boolean
  notNull: boolean
  fkTable: string | null
}

export interface TableInfo {
  name: string
  rowCount: number
  columns: ColumnInfo[]
}

export type QueryResult =
  | { kind: 'select'; columns: string[]; values: SqlValue[][]; ms: number }
  | { kind: 'write'; rowsModified: number; ms: number }
  | { kind: 'error'; message: string }

/** Create a fresh in-memory database seeded with the sample webshop data. */
export function createDatabase(SQL: SqlJsStatic): Database {
  const db = new SQL.Database()
  db.run('PRAGMA foreign_keys = ON;')
  db.run(SEED_SQL)
  return db
}

/**
 * Run one or more SQL statements. If any statement produces rows,
 * the last result set is returned. Otherwise the number of modified
 * rows is reported. Errors never throw; they come back as a result kind.
 */
export function runQuery(db: Database, sql: string): QueryResult {
  const started = performance.now()
  try {
    const results = db.exec(sql)
    const ms = performance.now() - started
    if (results.length > 0) {
      const last = results[results.length - 1]
      return { kind: 'select', columns: last.columns, values: last.values, ms }
    }
    return { kind: 'write', rowsModified: db.getRowsModified(), ms }
  } catch (err) {
    return { kind: 'error', message: err instanceof Error ? err.message : String(err) }
  }
}

/** Read table, column, primary key and foreign key info from sqlite_master and pragmas. */
export function introspect(db: Database): TableInfo[] {
  const tablesRes = db.exec(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  )
  if (tablesRes.length === 0) return []

  return tablesRes[0].values.map(row => {
    const name = String(row[0])

    const fkMap = new Map<string, string>()
    const fkRes = db.exec(`PRAGMA foreign_key_list("${name}")`)
    if (fkRes.length > 0) {
      // foreign_key_list columns: id, seq, table, from, to, ...
      for (const fk of fkRes[0].values) {
        fkMap.set(String(fk[3]), String(fk[2]))
      }
    }

    const colsRes = db.exec(`PRAGMA table_info("${name}")`)
    // table_info columns: cid, name, type, notnull, dflt_value, pk
    const columns: ColumnInfo[] = colsRes[0].values.map(col => ({
      name: String(col[1]),
      type: String(col[2]),
      notNull: Number(col[3]) === 1,
      pk: Number(col[5]) > 0,
      fkTable: fkMap.get(String(col[1])) ?? null,
    }))

    const countRes = db.exec(`SELECT COUNT(*) FROM "${name}"`)
    const rowCount = Number(countRes[0].values[0][0])

    return { name, rowCount, columns }
  })
}
