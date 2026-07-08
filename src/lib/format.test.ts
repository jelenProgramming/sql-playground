import { describe, expect, it } from 'vitest'
import { displayCell, formatMs, truncate } from './format'

describe('formatMs', () => {
  it('shows sub-millisecond runs as <1 ms', () => {
    expect(formatMs(0.4)).toBe('<1 ms')
  })

  it('rounds milliseconds', () => {
    expect(formatMs(12.6)).toBe('13 ms')
  })

  it('switches to seconds above 1000 ms', () => {
    expect(formatMs(2500)).toBe('2.50 s')
  })
})

describe('displayCell', () => {
  it('renders NULL for null', () => {
    expect(displayCell(null)).toBe('NULL')
  })

  it('renders blobs with their size', () => {
    expect(displayCell(new Uint8Array([1, 2, 3]))).toBe('BLOB (3 bytes)')
  })

  it('renders numbers and strings as-is', () => {
    expect(displayCell(42)).toBe('42')
    expect(displayCell('hello')).toBe('hello')
  })
})

describe('truncate', () => {
  it('collapses whitespace', () => {
    expect(truncate('SELECT *\n  FROM products', 100)).toBe('SELECT * FROM products')
  })

  it('cuts long text with an ellipsis', () => {
    const long = 'x'.repeat(200)
    const out = truncate(long, 50)
    expect(out.length).toBe(50)
    expect(out.endsWith('...')).toBe(true)
  })
})
