// Sample database: a small European webshop.
// Deliberately small enough to read at a glance, rich enough for joins,
// aggregates, subqueries and window functions.

export const DB_NAME = 'webshop.db'

export const SEED_SQL = `
CREATE TABLE categories (
  id    INTEGER PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE
);

CREATE TABLE products (
  id          INTEGER PRIMARY KEY,
  name        TEXT    NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  price       REAL    NOT NULL,
  stock       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE customers (
  id         INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  country    TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE orders (
  id          INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  status      TEXT    NOT NULL CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled')),
  created_at  TEXT    NOT NULL
);

CREATE TABLE order_items (
  id         INTEGER PRIMARY KEY,
  order_id   INTEGER NOT NULL REFERENCES orders(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  unit_price REAL    NOT NULL
);

INSERT INTO categories (id, name) VALUES
  (1, 'Electronics'),
  (2, 'Books'),
  (3, 'Home'),
  (4, 'Sports'),
  (5, 'Toys');

INSERT INTO products (id, name, category_id, price, stock) VALUES
  (1,  'Wireless Mouse',              1, 24.90,  120),
  (2,  'Mechanical Keyboard',         1, 89.00,   45),
  (3,  'USB-C Hub',                   1, 39.50,   80),
  (4,  'Noise-Cancelling Headphones', 1, 199.00,  25),
  (5,  'SQL for Humans',              2, 32.00,   60),
  (6,  'Clean Code',                  2, 41.50,   35),
  (7,  'Espresso Maker',              3, 129.00,  18),
  (8,  'Desk Lamp',                   3, 45.00,   50),
  (9,  'Yoga Mat',                    4, 19.90,   90),
  (10, 'Running Shoes',               4, 89.90,   40),
  (11, 'Chess Set',                   5, 27.50,   30),
  (12, 'Lego Robot Kit',              5, 149.00,  15),
  (13, 'The Pragmatic Programmer',    2, 38.00,   28);

INSERT INTO customers (id, name, email, country, created_at) VALUES
  (1,  'Ana Kovac',     'ana.kovac@example.com',     'Slovenia', '2025-11-03'),
  (2,  'Luka Novak',    'luka.novak@example.com',    'Slovenia', '2025-11-18'),
  (3,  'Franz Huber',   'franz.huber@example.com',   'Austria',  '2025-12-02'),
  (4,  'Maria Gruber',  'maria.gruber@example.com',  'Austria',  '2025-12-20'),
  (5,  'Giulia Rossi',  'giulia.rossi@example.com',  'Italy',    '2026-01-05'),
  (6,  'Ivan Horvat',   'ivan.horvat@example.com',   'Croatia',  '2026-01-22'),
  (7,  'Hans Meyer',    'hans.meyer@example.com',    'Germany',  '2026-02-08'),
  (8,  'Petra Zupan',   'petra.zupan@example.com',   'Slovenia', '2026-02-25'),
  (9,  'Stefan Wagner', 'stefan.wagner@example.com', 'Austria',  '2026-03-11'),
  (10, 'Nina Kranjc',   'nina.kranjc@example.com',   'Slovenia', '2026-04-02');

INSERT INTO orders (id, customer_id, status, created_at) VALUES
  (1,  1, 'paid',      '2026-01-12'),
  (2,  2, 'shipped',   '2026-01-12'),
  (3,  3, 'shipped',   '2026-01-25'),
  (4,  1, 'paid',      '2026-02-03'),
  (5,  4, 'shipped',   '2026-02-10'),
  (6,  5, 'cancelled', '2026-02-10'),
  (7,  2, 'paid',      '2026-02-21'),
  (8,  6, 'shipped',   '2026-03-04'),
  (9,  7, 'paid',      '2026-03-15'),
  (10, 3, 'shipped',   '2026-03-15'),
  (11, 8, 'pending',   '2026-03-28'),
  (12, 1, 'shipped',   '2026-04-06'),
  (13, 4, 'paid',      '2026-04-14'),
  (14, 5, 'shipped',   '2026-04-22'),
  (15, 2, 'paid',      '2026-05-05'),
  (16, 6, 'cancelled', '2026-05-13'),
  (17, 7, 'shipped',   '2026-05-13'),
  (18, 8, 'paid',      '2026-06-01'),
  (19, 3, 'pending',   '2026-06-09'),
  (20, 1, 'pending',   '2026-06-18');

INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES
  (1,  1,  1,  1, 24.90),
  (2,  1,  5,  1, 32.00),
  (3,  2,  2,  1, 89.00),
  (4,  3,  4,  1, 199.00),
  (5,  3,  3,  1, 39.50),
  (6,  4,  6,  2, 41.50),
  (7,  5,  7,  1, 129.00),
  (8,  6,  12, 1, 149.00),
  (9,  7,  9,  2, 19.90),
  (10, 7,  10, 1, 89.90),
  (11, 8,  13, 1, 38.00),
  (12, 8,  5,  1, 32.00),
  (13, 9,  2,  1, 89.00),
  (14, 9,  1,  1, 24.90),
  (15, 10, 10, 1, 89.90),
  (16, 11, 3,  2, 39.50),
  (17, 12, 4,  1, 199.00),
  (18, 13, 5,  3, 32.00),
  (19, 14, 12, 1, 149.00),
  (20, 15, 6,  1, 41.50),
  (21, 15, 13, 1, 38.00),
  (22, 16, 1,  1, 24.90),
  (23, 17, 7,  1, 129.00),
  (24, 17, 9,  1, 19.90),
  (25, 18, 10, 2, 89.90),
  (26, 19, 2,  1, 89.00),
  (27, 20, 1,  2, 24.90),
  (28, 20, 3,  1, 39.50);
`
