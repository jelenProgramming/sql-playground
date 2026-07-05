// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest'
import { createRequire } from 'node:module'
import initSqlJs, { type SqlJsStatic } from 'sql.js'
import { createDatabase, introspect, runQuery } from './database'

const nodeRequire = createRequire(import.meta.url)

let SQL: SqlJsStatic

beforeAll(async () => {
  SQL = await initSqlJs({
    locateFile: () => nodeRequire.resolve('sql.js/dist/sql-wasm.wasm'),
  })
})

describe('createDatabase', () => {
  it('seeds the expected tables with the expected row counts', () => {
    const db = createDatabase(SQL)
    const tables = introspect(db)
    const counts = Object.fromEntries(tables.map(t => [t.name, t.rowCount]))
    expect(counts).toEqual({
      categories: 5,
      customers: 10,
      orders: 20,
      order_items: 28,
      products: 13,
    })
    db.close()
  })

  it('exposes primary and foreign keys through introspection', () => {
    const db = createDatabase(SQL)
    const orders = introspect(db).find(t => t.name === 'orders')
    expect(orders).toBeDefined()
    const idCol = orders!.columns.find(c => c.name === 'id')
    const customerCol = orders!.columns.find(c => c.name === 'customer_id')
    expect(idCol!.pk).toBe(true)
    expect(customerCol!.fkTable).toBe('customers')
    db.close()
  })

  it('enforces foreign keys', () => {
    const db = createDatabase(SQL)
    const outcome = runQuery(
      db,
      "INSERT INTO orders (customer_id, status, created_at) VALUES (999, 'paid', '2026-07-01');",
    )
    expect(outcome.kind).toBe('error')
    db.close()
  })
})

describe('runQuery', () => {
  it('returns a select result with columns and values', () => {
    const db = createDatabase(SQL)
    const outcome = runQuery(db, 'SELECT name FROM categories ORDER BY id;')
    expect(outcome.kind).toBe('select')
    if (outcome.kind === 'select') {
      expect(outcome.columns).toEqual(['name'])
      expect(outcome.values[0]).toEqual(['Electronics'])
      expect(outcome.values).toHaveLength(5)
    }
    db.close()
  })

  it('reports modified rows for writes', () => {
    const db = createDatabase(SQL)
    const outcome = runQuery(db, "UPDATE products SET stock = stock + 1 WHERE category_id = 1;")
    expect(outcome.kind).toBe('write')
    if (outcome.kind === 'write') {
      expect(outcome.rowsModified).toBe(4)
    }
    db.close()
  })

  it('returns errors as values, never throws', () => {
    const db = createDatabase(SQL)
    const outcome = runQuery(db, 'SELEC broken;')
    expect(outcome.kind).toBe('error')
    if (outcome.kind === 'error') {
      expect(outcome.message.length).toBeGreaterThan(0)
    }
    db.close()
  })

  it('returns the last result set when multiple statements run', () => {
    const db = createDatabase(SQL)
    const outcome = runQuery(db, 'SELECT 1 AS a; SELECT 2 AS b;')
    expect(outcome.kind).toBe('select')
    if (outcome.kind === 'select') {
      expect(outcome.columns).toEqual(['b'])
      expect(outcome.values).toEqual([[2]])
    }
    db.close()
  })
})
