import { useState } from 'react'
import type { Database } from 'sql.js'
import { EXERCISES, checkExercise, type CheckResult } from '../exercises/exercises'
import { runQuery, type QueryResult } from '../db/database'
import type { Lang, UIStrings } from '../i18n'
import QueryEditor from './QueryEditor'
import ResultsTable from './ResultsTable'

interface Props {
  makeDb: () => Database
  passed: Set<string>
  onPass: (id: string) => void
  lang: Lang
  t: UIStrings
}

export default function ExercisePanel({ makeDb, passed, onPass, lang, t }: Props) {
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
      <p className="exProgress">{t.exProgress(passed.size, EXERCISES.length)}</p>
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
                <span className="exDots" aria-label={t.diffLabels[exercise.difficulty]}>
                  {'●'.repeat(exercise.difficulty)}
                  {'○'.repeat(3 - exercise.difficulty)}
                </span>
                <span className="exTitle">{exercise.title[lang]}</span>
                {passed.has(exercise.id) && (
                  <span className="exDone" aria-label={t.solved}>
                    {t.solved}
                  </span>
                )}
              </button>
              {isOpen && (
                <div className="exBody">
                  <p className="exPrompt">{exercise.prompt[lang]}</p>
                  <details className="exHint">
                    <summary>{t.hint}</summary>
                    <p>{exercise.hint[lang]}</p>
                  </details>
                  <QueryEditor
                    value={drafts[exercise.id] ?? ''}
                    onChange={sql => setDraft(exercise.id, sql)}
                    onRun={() => runPreview(exercise.id)}
                    label={t.yourQuery}
                    hintRuns={t.editorHintRuns}
                    rows={5}
                  />
                  <div className="actionRow">
                    <button type="button" className="btnPrimary" onClick={() => runPreview(exercise.id)}>
                      {t.run}
                    </button>
                    <button type="button" className="btnGhost" onClick={() => runCheck(exercise.id)}>
                      {t.checkAnswer}
                    </button>
                    <button
                      type="button"
                      className="btnPlain"
                      onClick={() => toggleSolution(exercise.id)}
                    >
                      {shownSolutions.has(exercise.id) ? t.hideSolution : t.showSolution}
                    </button>
                  </div>
                  {check && (
                    <p
                      className={check.pass ? 'checkMsg checkPass passFlash' : 'checkMsg checkFail'}
                      role="status"
                    >
                      {check.pass ? t.correct : check.message}
                    </p>
                  )}
                  {shownSolutions.has(exercise.id) && (
                    <pre className="solution">{exercise.solution}</pre>
                  )}
                  {preview !== undefined && (
                    <div className="fadeUp">
                      <ResultsTable result={preview} t={t} />
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
