import type { RefObject } from 'react'

interface Props {
  value: string
  onChange: (sql: string) => void
  onRun: () => void
  label: string
  hintRuns: string
  textareaRef?: RefObject<HTMLTextAreaElement>
  rows?: number
}

export default function QueryEditor({
  value,
  onChange,
  onRun,
  label,
  hintRuns,
  textareaRef,
  rows = 7,
}: Props) {
  return (
    <div className="editorBlock">
      <div className="editorHead">
        <span className="editorLabel">{label}</span>
        <span className="editorHint">
          <kbd>Ctrl</kbd>+<kbd>Enter</kbd> {hintRuns}
        </span>
      </div>
      <textarea
        ref={textareaRef}
        className="editor"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault()
            onRun()
          }
        }}
        rows={rows}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        placeholder="SELECT * FROM products;"
        aria-label={label}
      />
    </div>
  )
}
