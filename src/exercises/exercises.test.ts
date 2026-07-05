// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest'
import { createRequire } from 'node:module'
import initSqlJs, { type SqlJsStatic } from 'sql.js'
import { createDatabase, runQuery } from '../db/database'
import { EXERCISES, checkExercise } from './exercises'

const nodeRequire = createRequire(import.meta.url)

let SQL: SqlJsStatic
const makeDb = () => createDatabase(SQL)

beforeAll(async () => {
  SQL = await initSqlJs({
    locateFile: () => nodeRequire.resolve('sql.js/dist/sql-wasm.wasm'),
  })
})

describe('exercise catalogue', () => {
  it('has unique ids', () => {
    const ids = EXERCISES.map(e => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it.each(EXERCISES)('$id: reference solution runs and returns rows', exercise => {
    const db = makeDb()
    const outcome = runQuery(db, exercise.solution)
    expect(outcome.kind).toBe('select')
    if (outcome.kind === 'select') {
      expect(outcome.values.length).toBeGreaterThan(0)
    }
    db.close()
  })

  it.each(EXERCISES)('$id: reference solution passes its own check', exercise => {
    const result = checkExercise(makeDb, exercise, exercise.solution)
    expect(result.pass).toBe(true)
  })
})

describe('checkExercise', () => {
  it('rejects a query with the wrong result', () => {
    const exercise = EXERCISES.find(e => e.id === 'countries')!
    const result = checkExercise(makeDb, exercise, 'SELECT name FROM customers;')
    expect(result.pass).toBe(false)
  })

  it('reports SQL errors kindly', () => {
    const exercise = EXERCISES[0]
    const result = checkExercise(makeDb, exercise, 'SELEC nope;')
    expect(result.pass).toBe(false)
    expect(result.message).toMatch(/SQL error/)
  })

  it('rejects non-SELECT statements', () => {
    const exercise = EXERCISES[0]
    const result = checkExercise(makeDb, exercise, "DELETE FROM order_items;")
    expect(result.pass).toBe(false)
    expect(result.message).toMatch(/SELECT/)
  })

  it('accepts an alternative correct formulation', () => {
    const exercise = EXERCISES.find(e => e.id === 'no-orders')!
    const alternative =
      'SELECT name FROM customers WHERE id NOT IN (SELECT customer_id FROM orders);'
    const result = checkExercise(makeDb, exercise, alternative)
    expect(result.pass).toBe(true)
  })
})
