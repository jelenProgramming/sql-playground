import { useEffect, useMemo, useRef, useState } from 'react'
import type { Database, SqlJsStatic } from 'sql.js'
import { loadSql } from './db/loadSql'
import {
  createDatabase,
  introspect,
  runQuery,
  type QueryResult,
  type TableInfo,
} from './db/database'
import { DB_NAME } from './db/seed'
import { loadJSON, saveJSON } from './lib/storage'
import { EXERCISES } from './exercises/exercises'
import { UI, loadStoredLang, storeLang, type Lang } from './i18n'
import SchemaSidebar from './components/SchemaSidebar'
import QueryEditor from './components/QueryEditor'
import ResultsTable from './components/ResultsTable'
import HistoryPanel from './components/HistoryPanel'
import ExercisePanel from './components/ExercisePanel'

const HISTORY_KEY = 'sqlpg:history'
const PASSED_KEY = 'sqlpg:passed'
const LANG_KEY = 'sqlpg:lang'

const DEFAULT_SQL = `SELECT p.name, p.price, c.name AS category
FROM products p
JOIN categories c ON c.id = p.category_id
ORDER BY p.price DESC;`

type Status = 'loading' | 'ready' | 'failed'
type Tab = 'playground' | 'exercises'

export default function App() {
  const [lang, setLang] = useState<Lang>(() => loadStoredLang(LANG_KEY))
  const [status, setStatus] = useState<Status>('loading')
  const [tab, setTab] = useState<Tab>('playground')
  const [schema, setSchema] = useState<TableInfo[]>([])
  const [sql, setSql] = useState(DEFAULT_SQL)
  const [result, setResult] = useState<QueryResult | null>(null)
  const [runCount, setRunCount] = useState(0)
  const [history, setHistory] = useState<string[]>(() => loadJSON<string[]>(HISTORY_KEY, []))
  const [passed, setPassed] = useState<Set<string>>(
    () => new Set(loadJSON<string[]>(PASSED_KEY, [])),
  )

  const sqlModuleRef = useRef<SqlJsStatic | null>(null)
  const dbRef = useRef<Database | null>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  const t = UI[lang]

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  useEffect(() => {
    let cancelled = false
    loadSql()
      .then(SQL => {
        if (cancelled) return
        sqlModuleRef.current = SQL
        const db = createDatabase(SQL)
        dbRef.current = db
        setSchema(introspect(db))
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('failed')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const makeDb = useMemo(() => {
    return () => {
      const SQL = sqlModuleRef.current
      if (!SQL) throw new Error('sql.js is not loaded yet')
      return createDatabase(SQL)
    }
  }, [])

  const switchLang = (next: Lang) => {
    setLang(next)
    storeLang(LANG_KEY, next)
  }

  const pushHistory = (query: string) => {
    setHistory(prev => {
      const next = [query, ...prev.filter(q => q !== query)].slice(0, 25)
      saveJSON(HISTORY_KEY, next)
      return next
    })
  }

  const runPlayground = () => {
    const db = dbRef.current
    if (!db || !sql.trim()) return
    const outcome = runQuery(db, sql)
    setResult(outcome)
    setRunCount(n => n + 1)
    if (outcome.kind !== 'error') {
      pushHistory(sql.trim())
      setSchema(introspect(db))
    }
  }

  const resetDb = () => {
    const SQL = sqlModuleRef.current
    if (!SQL) return
    dbRef.current?.close()
    const db = createDatabase(SQL)
    dbRef.current = db
    setSchema(introspect(db))
    setResult(null)
  }

  const pickTable = (name: string) => {
    setTab('playground')
    setSql(`SELECT * FROM ${name} LIMIT 10;`)
    window.setTimeout(() => editorRef.current?.focus(), 0)
  }

  const onPass = (id: string) => {
    setPassed(prev => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      saveJSON(PASSED_KEY, [...next])
      return next
    })
  }

  const langToggle = (
    <div className="langToggle" role="group" aria-label="Language">
      <button
        type="button"
        className={lang === 'en' ? 'langToggle__btn langToggle__btn--on' : 'langToggle__btn'}
        onClick={() => switchLang('en')}
      >
        EN
      </button>
      <button
        type="button"
        className={lang === 'de' ? 'langToggle__btn langToggle__btn--on' : 'langToggle__btn'}
        onClick={() => switchLang('de')}
      >
        DE
      </button>
    </div>
  )

  if (status === 'loading') {
    return (
      <div className="bootScreen">
        <p className="bootTitle">SQL Playground</p>
        <p className="bootSub">{t.bootLoading}</p>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="bootScreen">
        <p className="bootTitle">SQL Playground</p>
        <p className="bootSub">{t.bootFailed}</p>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="logo">SQL Playground</span>
          <span className="brandSub">{t.brandSub}</span>
        </div>
        <nav className="nav">
          {langToggle}
          <a
            href="https://github.com/jelenProgramming/sql-playground"
            target="_blank"
            rel="noopener noreferrer"
          >
            Source ↗
          </a>
          <a
            href="https://portfolio-green-zeta-25.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="navCta"
          >
            Portfolio
          </a>
        </nav>
      </header>

      <div className="shell">
        <SchemaSidebar schema={schema} dbName={DB_NAME} onPickTable={pickTable} t={t} />

        <main className="main">
          <div className="tabs" role="tablist" aria-label="Mode">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'playground'}
              className={tab === 'playground' ? 'tab tabActive' : 'tab'}
              onClick={() => setTab('playground')}
            >
              {t.tabPlayground}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'exercises'}
              className={tab === 'exercises' ? 'tab tabActive' : 'tab'}
              onClick={() => setTab('exercises')}
            >
              {t.tabExercises} ({passed.size}/{EXERCISES.length})
            </button>
          </div>

          {tab === 'playground' ? (
            <section className="playground">
              <QueryEditor
                value={sql}
                onChange={setSql}
                onRun={runPlayground}
                label={t.queryLabel}
                hintRuns={t.editorHintRuns}
                textareaRef={editorRef}
              />
              <div className="actionRow">
                <button type="button" className="btnPrimary" onClick={runPlayground}>
                  {t.runQuery}
                </button>
                <button type="button" className="btnGhost" onClick={resetDb}>
                  {t.resetDb}
                </button>
              </div>
              <div key={runCount} className="fadeUp">
                <ResultsTable result={result} t={t} />
              </div>
              <HistoryPanel
                history={history}
                onPick={q => {
                  setSql(q)
                  editorRef.current?.focus()
                }}
                title={t.historyTitle}
              />
            </section>
          ) : (
            <ExercisePanel makeDb={makeDb} passed={passed} onPass={onPass} lang={lang} t={t} />
          )}
        </main>
      </div>

      <footer className="footer">
        <span>{t.footer}</span>
        <a href="https://github.com/jelenProgramming" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </footer>
    </div>
  )
}
