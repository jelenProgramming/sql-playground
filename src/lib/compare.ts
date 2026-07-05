import type { SqlValue } from 'sql.js'

export interface ResultSet {
  columns: string[]
  values: SqlValue[][]
}

export interface CompareOptions {
  /** When true, row order must match exactly (exercises that require ORDER BY). */
  ordered: boolean
}

export interface CompareOutcome {
  pass: boolean
  reason: string | null
}

/**
 * Normalize a single cell so that equivalent values compare equal:
 * floats are rounded to 6 decimals, and values are tagged by type so
 * the string '1' never equals the number 1.
 */
export function normalizeCell(value: SqlValue): string {
  if (value === null) return 'null'
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return `n:${value}`
    const rounded = value.toFixed(6).replace(/0+$/, '').replace(/\.$/, '')
    return `n:${rounded}`
  }
  if (value instanceof Uint8Array) return `b:${Array.from(value).join(',')}`
  return `s:${String(value)}`
}

function normalizeRow(row: SqlValue[]): string {
  return row.map(normalizeCell).join('|')
}

/**
 * Compare two result sets by values. Column names are not compared
 * (aliases are the author's choice), but the column count and every
 * cell value must match. Unordered comparison treats rows as a multiset.
 */
export function compareResults(
  expected: ResultSet,
  actual: ResultSet,
  options: CompareOptions,
): CompareOutcome {
  if (actual.columns.length !== expected.columns.length) {
    return {
      pass: false,
      reason: `Expected ${expected.columns.length} column(s), got ${actual.columns.length}.`,
    }
  }
  if (actual.values.length !== expected.values.length) {
    return {
      pass: false,
      reason: `Expected ${expected.values.length} row(s), got ${actual.values.length}.`,
    }
  }

  const exp = expected.values.map(normalizeRow)
  const act = actual.values.map(normalizeRow)
  if (!options.ordered) {
    exp.sort()
    act.sort()
  }

  for (let i = 0; i < exp.length; i++) {
    if (exp[i] !== act[i]) {
      return {
        pass: false,
        reason: options.ordered
          ? `Row ${i + 1} differs from the expected result. Check your ORDER BY.`
          : 'Row values differ from the expected result.',
      }
    }
  }
  return { pass: true, reason: null }
}
