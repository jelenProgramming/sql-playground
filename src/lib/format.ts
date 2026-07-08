import type { SqlValue } from 'sql.js'

/** Human friendly execution time. */
export function formatMs(ms: number): string {
  if (ms < 1) return '<1 ms'
  if (ms < 1000) return `${Math.round(ms)} ms`
  return `${(ms / 1000).toFixed(2)} s`
}

/** How a cell is rendered in the results table. */
export function displayCell(value: SqlValue): string {
  if (value === null) return 'NULL'
  if (value instanceof Uint8Array) return `BLOB (${value.length} bytes)`
  return String(value)
}

/** Shorten long queries for the history list. */
export function truncate(text: string, max: number): string {
  const collapsed = text.replace(/\s+/g, ' ').trim()
  if (collapsed.length <= max) return collapsed
  return `${collapsed.slice(0, max - 1)}...`
}
