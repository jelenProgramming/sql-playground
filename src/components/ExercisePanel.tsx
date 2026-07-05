import { useState } from 'react'
import type { Database } from 'sql.js'
import { EXERCISES, checkExercise, type CheckResult } from '../exercises/exercises'
import { runQuery, type QueryResult } from '../db/database'
import QueryEditor from './QueryEditor'
import ResultsTable from './ResultsTable'

interface Props {
  makeDb: () => Database
  passed: Set<string>
  onPass: (id: string) => void
}

const DIFF_LABELS: Record<1 | 2 | 3, string> = { 1: 'easy', 2: 'medium', 3: 'hard' }

export default function ExercisePanel({ makeDb, passed, onPass }: Props) {
  const [openId, setOpenId] = useState<string | null>(EXERCISES[0]?.id ?? null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [previews, setPreviews] = useState<Record<string, QueryResult>>({})
  const [checks, setChecks] = useState<Record<string, CheckResult>>({})
  const [shownSolutions, setShownSolutions] = useState<Set<string>>(new Set())

  const setDraft = (id: string, sql: string) => {
    setDrafts(prev => ({ ...prev, [id]: sql }))
  }

  const runPreview = (id: string) => {
    const sql = drafts[id] ?? ''
    if (!sql.trim()) return
    const db = makeDb()
    try {
      const outcome = runQuery(db, sql)
      setPreviews(prev => ({ ...prev, [id]: outcome }))
    } finally {
      db.close()
    }
  }

  const runCheck = (id: string) => {
    const exercise = EXERCISES.find(e => e.id === id)
    const sql = drafts[id] ?? ''
    if (!exercise || !sql.trim()) return
    const outcome = checkExercise(makeDb, exercise, sql)
    setChecks(prev => ({ ...prev, [id]: outcome }))
    if (outcome.pass) onPass(id)
  }

  const toggleSolution = (id: string) => {
    setShownSolutions(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <section className="exercises">
      <p className="exProgress">
        {passed.size} of {EXERCISES.length} solved. Answers are checked against the real result
        set, so any correct query passes, not just the reference one.
      </p>
      <ul className="exList">
        {EXERCISES.map(exercise => {
          const isOpen = openId === exercise.id
          const check = checks[exercise.id]
          const preview = previews[exercise.id]
          return (
            <li key={exercise.id} className="exItem">
              <button
                type="button"
                className="exHeader"
                onClick={() => setOpenId(isOpen ? null : exercise.id)}
                aria-expanded={isOpen}
              >
                <span className="exDots" aria-label={DIFF_LABELS[exercise.difficulty]}>
                  {'●'.repeat(exercise.difficulty)}
                  {'○'.repeat(3 - exercise.difficulty)}
                </span>
                <span className="exTitle">{exercise.title}</span>
                {passed.has(exercise.id) && (
                  <span className="exDone" aria-label="solved">
                    ✓ solved
                  </span>
                )}
              </button>
              {isOpen && (
                <div className="exBody">
                  <p className="exPrompt">{exercise.prompt}</p>
                  <details className="exHint">
                    <summary>Hint</summary>
                    <p>{exercise.hint}</p>
                  </details>
                  <QueryEditor
                    value={drafts[exercise.id] ?? ''}
                    onChange={sql => setDraft(exercise.id, sql)}
                    onRun={() => runPreview(exercise.id)}
                    label="Your query"
                    rows={5}
                  />
                  <div className="actionRow">
                    <button type="button" className="btnPrimary" onClick={() => runPreview(exercise.id)}>
                      Run
                    </button>
                    <button type="button" className="btnGhost" onClick={() => runCheck(exercise.id)}>
                      Check answer
                    </button>
                    <button
                      type="button"
                      className="btnPlain"
                      onClick={() => toggleSolution(exercise.id)}
                    >
                      {shownSolutions.has(exercise.id) ? 'Hide solution' : 'Show solution'}
                    </button>
                  </div>
                  {check && (
                    <p className={check.pass ? 'checkMsg checkPass passFlash' : 'checkMsg checkFail'} role="status">
                      {check.message}
                    </p>
                  )}
                  {shownSolutions.has(exercise.id) && (
                    <pre className="solution">{exercise.solution}</pre>
                  )}
                  {preview !== undefined && (
                    <div className="fadeUp">
                      <ResultsTable result={preview} />
                    </div>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
