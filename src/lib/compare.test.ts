import { describe, expect, it } from 'vitest'
import { compareResults, normalizeCell } from './compare'

const cols = (n: number) => Array.from({ length: n }, (_, i) => `c${i}`)

describe('normalizeCell', () => {
  it('tags types so string "1" never equals number 1', () => {
    expect(normalizeCell('1')).not.toBe(normalizeCell(1))
  })

  it('treats 49.8 and 49.800000004 as equal after rounding', () => {
    expect(normalizeCell(49.8)).toBe(normalizeCell(49.800000004))
  })

  it('keeps integers exact', () => {
    expect(normalizeCell(5)).toBe('n:5')
  })

  it('normalizes NULL', () => {
    expect(normalizeCell(null)).toBe('null')
  })
})

describe('compareResults', () => {
  it('passes when rows match in any order for unordered exercises', () => {
    const expected = { columns: cols(2), values: [['a', 1], ['b', 2]] }
    const actual = { columns: cols(2), values: [['b', 2], ['a', 1]] }
    expect(compareResults(expected, actual, { ordered: false }).pass).toBe(true)
  })

  it('fails on wrong order when ordered comparison is required', () => {
    const expected = { columns: cols(1), values: [[1], [2]] }
    const actual = { columns: cols(1), values: [[2], [1]] }
    const outcome = compareResults(expected, actual, { ordered: true })
    expect(outcome.pass).toBe(false)
    expect(outcome.reason).toMatch(/ORDER BY/)
  })

  it('fails on column count mismatch with a helpful reason', () => {
    const expected = { columns: cols(2), values: [['a', 1]] }
    const actual = { columns: cols(1), values: [['a']] }
    const outcome = compareResults(expected, actual, { ordered: false })
    expect(outcome.pass).toBe(false)
    expect(outcome.reason).toMatch(/column/)
  })

  it('fails on row count mismatch', () => {
    const expected = { columns: cols(1), values: [[1], [2]] }
    const actual = { columns: cols(1), values: [[1]] }
    const outcome = compareResults(expected, actual, { ordered: false })
    expect(outcome.pass).toBe(false)
    expect(outcome.reason).toMatch(/row/)
  })

  it('does not compare column names, only values', () => {
    const expected = { columns: ['total'], values: [[10]] }
    const actual = { columns: ['sum_of_stuff'], values: [[10]] }
    expect(compareResults(expected, actual, { ordered: false }).pass).toBe(true)
  })
})
