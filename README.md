# SQL Playground

An interactive SQL sandbox that runs entirely in the browser. SQLite is compiled to
WebAssembly (sql.js), so every query executes locally: no server, no accounts, nothing
sent anywhere.

Comes with a small European webshop database (customers, products, orders, line items)
and 12 guided exercises, from a first SELECT to window functions. Answers are verified
against the actual result set of a reference solution, so any correct query passes,
not just the expected one.

## Why this project

My other projects show React and Laravel apps. This one fills in what they do not show:

- TypeScript, strict mode, across the whole codebase
- Real unit tests (Vitest + Testing Library), including a test that runs every
  exercise's reference solution against the seeded database
- SQL beyond basic CRUD: joins, aggregates, HAVING, subqueries, window functions
- WebAssembly integration and schema introspection via SQLite pragmas

## Features

- Query editor with Ctrl+Enter to run, error reporting, and execution time
- Schema sidebar built from live introspection (tables, columns, PK/FK, row counts)
- Playground mode: run anything, including INSERT/UPDATE/DDL, then reset the database
- Exercise mode: 12 tasks with hints, solutions, and result-set checking
- Query history and exercise progress persisted in localStorage
- Motion respects `prefers-reduced-motion`

## Stack

React 18, TypeScript, Vite, sql.js (SQLite 3 as WASM), Vitest, Testing Library.

## Run it

```bash
npm install
npm run dev     # local dev server
npm test        # unit tests
npm run build   # type-check + production build
```

## Author

David Jelen | [GitHub](https://github.com/jelenProgramming) |
[Portfolio](https://portfolio-green-zeta-25.vercel.app)
