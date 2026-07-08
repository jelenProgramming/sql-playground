export type Lang = 'en' | 'de'

export interface Localized {
  en: string
  de: string
}

export interface UIStrings {
  brandSub: string
  tabPlayground: string
  tabExercises: string
  queryLabel: string
  editorHintRuns: string
  runQuery: string
  resetDb: string
  placeholderResult: string
  rows: string
  columns: string
  execution: string
  writeOk: (n: number, ms: string) => string
  sqlError: string
  truncNote: (max: number, total: number) => string
  historyTitle: string
  sidebarNote: string
  rowsBadge: (n: number) => string
  exProgress: (solved: number, total: number) => string
  hint: string
  yourQuery: string
  run: string
  checkAnswer: string
  showSolution: string
  hideSolution: string
  solved: string
  correct: string
  bootLoading: string
  bootFailed: string
  footer: string
  diffLabels: Record<1 | 2 | 3, string>
}

export const UI: Record<Lang, UIStrings> = {
  en: {
    brandSub: 'SQLite in your browser',
    tabPlayground: 'Playground',
    tabExercises: 'Exercises',
    queryLabel: 'Query',
    editorHintRuns: 'runs',
    runQuery: 'Run query',
    resetDb: 'Reset database',
    placeholderResult: 'Run a query to see results here.',
    rows: 'rows',
    columns: 'columns',
    execution: 'execution',
    writeOk: (n, ms) => `OK. ${n} row(s) modified in ${ms}.`,
    sqlError: 'SQL error',
    truncNote: (max, total) => `Showing the first ${max} of ${total} rows.`,
    historyTitle: 'Recent queries',
    sidebarNote: 'Click a row count to query that table. Data lives in memory and is reseeded on reload.',
    rowsBadge: n => `${n} rows`,
    exProgress: (solved, total) =>
      `${solved} of ${total} solved. Answers are checked against the real result set, so any correct query passes, not just the reference one.`,
    hint: 'Hint',
    yourQuery: 'Your query',
    run: 'Run',
    checkAnswer: 'Check answer',
    showSolution: 'Show solution',
    hideSolution: 'Hide solution',
    solved: '✓ solved',
    correct: 'Correct. Your result matches the expected output.',
    bootLoading: 'Loading SQLite (WebAssembly)...',
    bootFailed: 'The SQLite WASM module could not be loaded. Check your connection and reload the page.',
    footer:
      'Built by David Jelen. React, TypeScript, sql.js. The database runs entirely in your browser, nothing is sent to a server.',
    diffLabels: { 1: 'easy', 2: 'medium', 3: 'hard' },
  },
  de: {
    brandSub: 'SQLite in deinem Browser',
    tabPlayground: 'Playground',
    tabExercises: 'Übungen',
    queryLabel: 'Abfrage',
    editorHintRuns: 'führt aus',
    runQuery: 'Abfrage ausführen',
    resetDb: 'Datenbank zurücksetzen',
    placeholderResult: 'Führe eine Abfrage aus, um hier Ergebnisse zu sehen.',
    rows: 'Zeilen',
    columns: 'Spalten',
    execution: 'Laufzeit',
    writeOk: (n, ms) => `OK. ${n} Zeile(n) geändert in ${ms}.`,
    sqlError: 'SQL-Fehler',
    truncNote: (max, total) => `Zeige die ersten ${max} von ${total} Zeilen.`,
    historyTitle: 'Letzte Abfragen',
    sidebarNote:
      'Klick auf eine Zeilenzahl, um die Tabelle abzufragen. Die Daten leben im Speicher und werden beim Neuladen neu aufgebaut.',
    rowsBadge: n => `${n} Zeilen`,
    exProgress: (solved, total) =>
      `${solved} von ${total} gelöst. Antworten werden gegen die echte Ergebnismenge geprüft, jede korrekte Abfrage zählt, nicht nur die Musterlösung.`,
    hint: 'Hinweis',
    yourQuery: 'Deine Abfrage',
    run: 'Ausführen',
    checkAnswer: 'Antwort prüfen',
    showSolution: 'Lösung zeigen',
    hideSolution: 'Lösung verbergen',
    solved: '✓ gelöst',
    correct: 'Richtig. Dein Ergebnis entspricht der erwarteten Ausgabe.',
    bootLoading: 'SQLite (WebAssembly) wird geladen...',
    bootFailed:
      'Das SQLite-WASM-Modul konnte nicht geladen werden. Prüfe deine Verbindung und lade die Seite neu.',
    footer:
      'Gebaut von David Jelen. React, TypeScript, sql.js. Die Datenbank läuft komplett in deinem Browser, nichts wird an einen Server geschickt.',
    diffLabels: { 1: 'leicht', 2: 'mittel', 3: 'schwer' },
  },
}

export function loadStoredLang(key: string): Lang {
  try {
    return window.localStorage.getItem(key) === 'de' ? 'de' : 'en'
  } catch {
    return 'en'
  }
}

export function storeLang(key: string, lang: Lang): void {
  try {
    window.localStorage.setItem(key, lang)
  } catch {
    // storage unavailable
  }
}
