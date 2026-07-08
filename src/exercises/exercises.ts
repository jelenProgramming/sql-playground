import type { Database } from 'sql.js'
import { runQuery } from '../db/database'
import { compareResults } from '../lib/compare'
import type { Localized } from '../i18n'

export interface Exercise {
  id: string
  title: Localized
  difficulty: 1 | 2 | 3
  prompt: Localized
  hint: Localized
  solution: string
  /** True when the task demands a specific row order (ORDER BY is part of the answer). */
  ordered: boolean
}

export const EXERCISES: Exercise[] = [
  {
    id: 'all-products',
    title: { en: 'Every product', de: 'Alle Produkte' },
    difficulty: 1,
    prompt: {
      en: 'List every product with all of its columns.',
      de: 'Liste jedes Produkt mit allen Spalten auf.',
    },
    hint: {
      en: 'SELECT * reads all columns from a table.',
      de: 'SELECT * liest alle Spalten einer Tabelle.',
    },
    solution: 'SELECT * FROM products;',
    ordered: false,
  },
  {
    id: 'cheap-products',
    title: { en: 'Under 40', de: 'Unter 40' },
    difficulty: 1,
    prompt: {
      en: 'Show the name and price of every product cheaper than 40, cheapest first.',
      de: 'Zeige Name und Preis jedes Produkts unter 40, das günstigste zuerst.',
    },
    hint: {
      en: 'Filter with WHERE, sort with ORDER BY price.',
      de: 'Filtern mit WHERE, sortieren mit ORDER BY price.',
    },
    solution: 'SELECT name, price FROM products WHERE price < 40 ORDER BY price;',
    ordered: true,
  },
  {
    id: 'top-expensive',
    title: { en: 'Top three by price', de: 'Top 3 nach Preis' },
    difficulty: 1,
    prompt: {
      en: 'Return the three most expensive products: name and price, priciest first.',
      de: 'Gib die drei teuersten Produkte zurück: Name und Preis, das teuerste zuerst.',
    },
    hint: {
      en: 'ORDER BY ... DESC combined with LIMIT.',
      de: 'ORDER BY ... DESC kombiniert mit LIMIT.',
    },
    solution: 'SELECT name, price FROM products ORDER BY price DESC LIMIT 3;',
    ordered: true,
  },
  {
    id: 'countries',
    title: { en: 'Customer countries', de: 'Kundenländer' },
    difficulty: 1,
    prompt: {
      en: 'List each country our customers come from, once per country, alphabetically.',
      de: 'Liste jedes Land unserer Kunden genau einmal auf, alphabetisch.',
    },
    hint: {
      en: 'DISTINCT removes duplicates.',
      de: 'DISTINCT entfernt Duplikate.',
    },
    solution: 'SELECT DISTINCT country FROM customers ORDER BY country;',
    ordered: true,
  },
  {
    id: 'orders-by-status',
    title: { en: 'Orders per status', de: 'Bestellungen je Status' },
    difficulty: 2,
    prompt: {
      en: 'Count how many orders exist in each status. Return status and the count. Any row order.',
      de: 'Zähle die Bestellungen je Status. Gib Status und Anzahl zurück. Zeilenreihenfolge egal.',
    },
    hint: {
      en: 'GROUP BY status, COUNT(*) per group.',
      de: 'GROUP BY status, COUNT(*) je Gruppe.',
    },
    solution: 'SELECT status, COUNT(*) AS order_count FROM orders GROUP BY status;',
    ordered: false,
  },
  {
    id: 'order-details',
    title: { en: 'Inside order 3', de: 'Bestellung 3 im Detail' },
    difficulty: 2,
    prompt: {
      en: 'For order number 3, list the product name, quantity and unit price of each line item. Any row order.',
      de: 'Liste für Bestellung Nummer 3 Produktname, Menge und Einzelpreis jeder Position auf. Zeilenreihenfolge egal.',
    },
    hint: {
      en: 'JOIN order_items to products on product_id, filter by order_id.',
      de: 'JOIN von order_items auf products über product_id, Filter auf order_id.',
    },
    solution: `SELECT p.name, oi.quantity, oi.unit_price
FROM order_items oi
JOIN products p ON p.id = oi.product_id
WHERE oi.order_id = 3;`,
    ordered: false,
  },
  {
    id: 'product-revenue',
    title: { en: 'Revenue per product', de: 'Umsatz je Produkt' },
    difficulty: 2,
    prompt: {
      en: 'For every product that was ever ordered, show its name and total revenue (quantity times unit price, summed over all orders), highest revenue first.',
      de: 'Zeige für jedes jemals bestellte Produkt den Namen und den Gesamtumsatz (Menge mal Einzelpreis, über alle Bestellungen summiert), höchster Umsatz zuerst.',
    },
    hint: {
      en: 'JOIN, then GROUP BY the product and SUM(quantity * unit_price).',
      de: 'JOIN, dann GROUP BY Produkt und SUM(quantity * unit_price).',
    },
    solution: `SELECT p.name, SUM(oi.quantity * oi.unit_price) AS revenue
FROM order_items oi
JOIN products p ON p.id = oi.product_id
GROUP BY p.id, p.name
ORDER BY revenue DESC;`,
    ordered: true,
  },
  {
    id: 'no-orders',
    title: { en: 'Quiet customers', de: 'Stille Kunden' },
    difficulty: 2,
    prompt: {
      en: 'Which customers have never placed an order? Return just their names, any order.',
      de: 'Welche Kunden haben nie bestellt? Nur die Namen, Reihenfolge egal.',
    },
    hint: {
      en: 'LEFT JOIN customers to orders and keep rows where the order id IS NULL.',
      de: 'LEFT JOIN von customers auf orders, behalte Zeilen, deren Bestell-id IS NULL ist.',
    },
    solution: `SELECT c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;`,
    ordered: false,
  },
  {
    id: 'never-ordered',
    title: { en: 'Shelf warmers', de: 'Ladenhüter' },
    difficulty: 2,
    prompt: {
      en: 'List the names of products that appear in no order at all. Any row order.',
      de: 'Liste die Namen der Produkte auf, die in keiner Bestellung vorkommen. Reihenfolge egal.',
    },
    hint: {
      en: 'A subquery with NOT IN, or a LEFT JOIN with IS NULL.',
      de: 'Eine Subquery mit NOT IN oder ein LEFT JOIN mit IS NULL.',
    },
    solution: 'SELECT name FROM products WHERE id NOT IN (SELECT product_id FROM order_items);',
    ordered: false,
  },
  {
    id: 'big-categories',
    title: { en: 'Well stocked categories', de: 'Gut gefüllte Kategorien' },
    difficulty: 2,
    prompt: {
      en: 'Which categories contain more than two products? Return the category name and its product count. Any row order.',
      de: 'Welche Kategorien enthalten mehr als zwei Produkte? Kategoriename und Produktanzahl, Reihenfolge egal.',
    },
    hint: {
      en: 'GROUP BY the category, then filter groups with HAVING.',
      de: 'GROUP BY Kategorie, dann Gruppen mit HAVING filtern.',
    },
    solution: `SELECT c.name, COUNT(*) AS product_count
FROM products p
JOIN categories c ON c.id = p.category_id
GROUP BY c.id, c.name
HAVING COUNT(*) > 2;`,
    ordered: false,
  },
  {
    id: 'country-avg',
    title: { en: 'Average basket per country', de: 'Durchschnittlicher Warenkorb je Land' },
    difficulty: 3,
    prompt: {
      en: 'For each country, compute the average order value (sum of the line items in an order) across all orders placed by customers from that country, rounded to 2 decimals. Return country and the average, any row order.',
      de: 'Berechne je Land den durchschnittlichen Bestellwert (Summe der Positionen einer Bestellung) über alle Bestellungen von Kunden aus diesem Land, auf 2 Dezimalstellen gerundet. Land und Durchschnitt, Reihenfolge egal.',
    },
    hint: {
      en: 'First aggregate order_items per order in a subquery, then join customers and average per country.',
      de: 'Erst order_items je Bestellung in einer Subquery aggregieren, dann customers joinen und je Land mitteln.',
    },
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
    title: { en: 'Running revenue', de: 'Laufender Umsatz' },
    difficulty: 3,
    prompt: {
      en: 'Excluding cancelled orders, show revenue per order date and a running total over time: date, the revenue on that day, cumulative revenue. Chronological order.',
      de: 'Ohne stornierte Bestellungen: Umsatz je Bestelldatum und laufende Summe über die Zeit: Datum, Tagesumsatz, kumulierter Umsatz. Chronologisch.',
    },
    hint: {
      en: 'GROUP BY the date, then SUM(...) OVER (ORDER BY date) for the running total.',
      de: 'GROUP BY Datum, dann SUM(...) OVER (ORDER BY Datum) für die laufende Summe.',
    },
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
