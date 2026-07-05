import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import ResultsTable from './ResultsTable'
import { UI } from '../i18n'

describe('ResultsTable', () => {
  it('shows a placeholder before any query has run', () => {
    render(<ResultsTable result={null} t={UI.en} />)
    expect(screen.getByText(/run a query/i)).toBeInTheDocument()
  })

  it('renders columns, rows and the meta bar for a select result', () => {
    render(
      <ResultsTable t={UI.en}
        result={{
          kind: 'select',
          columns: ['name', 'price'],
          values: [
            ['Yoga Mat', 19.9],
            ['USB-C Hub', 39.5],
          ],
          ms: 2,
        }}
      />,
    )
    expect(screen.getByText('name')).toBeInTheDocument()
    expect(screen.getByText('Yoga Mat')).toBeInTheDocument()
    expect(screen.getByText('39.5')).toBeInTheDocument()
    expect(screen.getByText('rows')).toBeInTheDocument()
  })

  it('renders NULL cells distinctly', () => {
    render(
      <ResultsTable t={UI.en}
        result={{ kind: 'select', columns: ['x'], values: [[null]], ms: 1 }}
      />,
    )
    const cell = screen.getByText('NULL')
    expect(cell).toHaveClass('nullCell')
  })

  it('renders SQL errors', () => {
    render(<ResultsTable t={UI.en} result={{ kind: 'error', message: 'near "SELEC": syntax error' }} />)
    expect(screen.getByRole('alert')).toHaveTextContent(/syntax error/)
  })

  it('renders write results with the modified row count', () => {
    render(<ResultsTable t={UI.en} result={{ kind: 'write', rowsModified: 3, ms: 1 }} />)
    expect(screen.getByRole('status')).toHaveTextContent(/3 row/)
  })
})
