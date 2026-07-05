import type { Database } from 'sql.js'
import { runQuery } from '../db/database'
import { compareResults } from '../lib/compare'

export interface Exercise {
  id: string
  title: string
  difficulty: 1 | 2 | 3
  prompt: string
  hint: string
  solution: string
  /** True when the task demands a specific row order (ORDER BY is part of the answer). */
  ordered: boolean
}

export const EXERCISES: Exercise[] = [
  {
    id: 'all-products',
    title: 'Every product',
    difficulty: 1,
    prompt: 'List every product with all of its columns.',
    hint: 'SELECT * reads all columns from a table.',
    solution: 'SELECT * FROM products;',
    ordered: false,
  },
  {
    id: 'cheap-products',
    title: 'Under 40',
    difficulty: 1,
    prompt:
      'Show the name and price of every product cheaper than 40, cheapest first.',
    hint: 'Filter with WHERE, sort with ORDER BY price.',
    solution: 'SELECT name, price FROM products WHERE price < 40 ORDER BY price;',
    ordered: true,
  },
  {
    id: 'top-expensive',
    title: 'Top three by price',
    difficulty: 1,
    prompt: 'Return the three most expensive products: name and price, priciest first.',
    hint: 'ORDER BY ... DESC combined with LIMIT.',
    solution: 'SELECT name, price FROM products ORDER BY price DESC LIMIT 3;',
    ordered: true,
  },
  {
    id: 'countries',
    title: 'Customer countries',
    difficulty: 1,
    prompt: 'List each country our customers come from, once per country, alphabetically.',
    hint: 'DISTINCT removes duplicates.',
    solution: 'SELECT DISTINCT country FROM customers ORDER BY country;',
    ordered: true,
  },
  {
    id: 'orders-by-status',
    title: 'Orders per status',
    difficulty: 2,
    prompt: 'Count how many orders exist in each status. Return status and the count. Any row order.',
    hint: 'GROUP BY status, COUNT(*) per group.',
    solution: 'SELECT status, COUNT(*) AS order_count FROM orders GROUP BY status;',
    ordered: false,
  },
  {
    id: 'order-details',
    title: 'Inside order 3',
    difficulty: 2,
    prompt:
      'For order number 3, list the product name, quantity and unit price of each line item. Any row order.',
    hint: 'JOIN order_items to products on product_id, filter by order_id.',
    solution: `SELECT p.name, oi.quantity, oi.unit_price
FROM order_items oi
JOIN products p ON p.id = oi.product_id
WHERE oi.order_id = 3;`,
    ordered: false,
  },
  {
    id: 'product-revenue',
    title: 'Revenue per product',
    difficulty: 2,
    prompt:
      'For every product that was ever ordered, show its name and total revenue (quantity times unit price, summed over all orders), highest revenue first.',
    hint: 'JOIN, then GROUP BY the product and SUM(quantity * unit_price).',
    solution: `SELECT p.name, SUM(oi.quantity * oi.unit_price) AS revenue
FROM order_items oi
JOIN products p ON p.id = oi.product_id
GROUP BY p.id, p.name
ORDER BY revenue DESC;`,
    ordered: true,
  },
  {
    id: 'no-orders',
    title: 'Quiet customers',
    difficulty: 2,
    prompt: 'Which customers have never placed an order? Return just their names, any order.',
    hint: 'LEFT JOIN customers to orders and keep rows where the order id IS NULL.',
    solution: `SELECT c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;`,
    ordered: false,
  },
  {
    id: 'never-ordered',
    title: 'Shelf warmers',
    difficulty: 2,
    prompt: 'List the names of products that appear in no order at all. Any row order.',
    hint: 'A subquery with NOT IN, or a LEFT JOIN with IS NULL.',
    solution: 'SELECT name FROM products WHERE id NOT IN (SELECT product_id FROM order_items);',
    ordered: false,
  },
  {
    id: 'big-categories',
    title: 'Well stocked categories',
    difficulty: 2,
    prompt:
      'Which categories contain more than two products? Return the category name and its product count. Any row order.',
    hint: 'GROUP BY the category, then filter groups with HAVING.',
    solution: `SELECT c.name, COUNT(*) AS product_count
FROM products p
JOIN categories c ON c.id = p.category_id
GROUP BY c.id, c.name
HAVING COUNT(*) > 2;`,
    ordered: false,
  },
  {
    id: 'country-avg',
    title: 'Average basket per country',
    difficulty: 3,
    prompt:
      'For each country, compute the average order value (sum of an order’s line items) across all orders placed by customers from that country, rounded to 2 decimals. Return country and the average, any row order.',
    hint: 'First aggregate order_items per order in a subquery, then join customers and average per country.',
    solution: `SELECT c.country, ROUND(AVG(t.total), 2) AS avg_order_value
FROM (
  SELECT o.id, o.customer_id, SUM(oi.quantity * oi.unit_price) AS total
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  GROUP BY o.id, o.customer_id
) t
JOIN customers c ON c.id = t.customer_id
GROUP BY c.country;`,
    ordered: false,
  },
  {
    id: 'running-revenue',
    title: 'Running revenue',
    difficulty: 3,
    prompt:
      'Excluding cancelled orders, show revenue per order date and a running total over time: date, that day’s revenue, cumulative revenue. Chronological order.',
    hint: 'GROUP BY the date, then SUM(...) OVER (ORDER BY date) for the running total.',
    solution: `SELECT o.created_at AS day,
       SUM(oi.quantity * oi.unit_price) AS day_revenue,
       SUM(SUM(oi.quantity * oi.unit_price)) OVER (ORDER BY o.created_at) AS running_total
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status != 'cancelled'
GROUP BY o.created_at
ORDER BY o.created_at;`,
    ordered: true,
  },
]

export interface CheckResult {
  pass: boolean
  message: string
}

/**
 * Check a user query against an exercise. Both the user query and the
 * reference solution run on their own fresh database, so earlier
 * playground experiments can never corrupt the check.
 */
export function checkExercise(
  makeDb: () => Database,
  exercise: Exercise,
  userSql: string,
): CheckResult {
  const userDb = makeDb()
  try {
    const actual = runQuery(userDb, userSql)
    if (actual.kind === 'error') {
      return { pass: false, message: `SQL error: ${actual.message}` }
    }
    if (actual.kind === 'write') {
      return { pass: false, message: 'Your query returned no rows. The task needs a SELECT.' }
    }

    const solutionDb = makeDb()
    try {
      const expected = runQuery(solutionDb, exercise.solution)
      if (expected.kind !== 'select') {
        return { pass: false, message: 'Internal error: the reference solution failed.' }
      }
      const outcome = compareResults(
        { columns: expected.columns, values: expected.values },
        { columns: actual.columns, values: actual.values },
        { ordered: exercise.ordered },
      )
      if (outcome.pass) {
        return { pass: true, message: 'Correct. Your result matches the expected output.' }
      }
      return { pass: false, message: outcome.reason ?? 'The result differs from the expected output.' }
    } finally {
      solutionDb.close()
    }
  } finally {
    userDb.close()
  }
}
