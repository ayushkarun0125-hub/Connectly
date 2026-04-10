import { useCallback, useEffect, useState } from 'react'
import { jsPDF } from 'jspdf'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useAppStore } from '../store/useAppStore'

const STORAGE_KEY = 'connectly-notes-v1'
const PAGE_TOP = 22
const PAGE_BOTTOM = 285
const MARGIN_X = 14
const LINE_HEIGHT = 6
const MAX_WIDTH_MM = 182

function readStoredNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { title: '', body: '' }
    const data = JSON.parse(raw)
    return {
      title: typeof data.title === 'string' ? data.title : '',
      body: typeof data.body === 'string' ? data.body : '',
    }
  } catch {
    return { title: '', body: '' }
  }
}

function exportNotesToPdf({ title, body }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const safeTitle = title.trim() || 'Connectly notes'
  const safeBody = body.trim() || '(No content)'

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(safeTitle, MARGIN_X, PAGE_TOP)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(80, 80, 80)
  doc.text(`Exported ${new Date().toLocaleString()}`, MARGIN_X, PAGE_TOP + 8)
  doc.setTextColor(0, 0, 0)

  const paragraphs = safeBody.split(/\n+/)
  let y = PAGE_TOP + 20

  paragraphs.forEach((paragraph) => {
    const lines = doc.splitTextToSize(paragraph, MAX_WIDTH_MM)
    lines.forEach((line) => {
      if (y > PAGE_BOTTOM) {
        doc.addPage()
        y = PAGE_TOP
      }
      doc.text(line, MARGIN_X, y)
      y += LINE_HEIGHT
    })
    y += LINE_HEIGHT * 0.5
  })

  const filename = `${safeTitle.replace(/[^\w\s-]/g, '').slice(0, 40) || 'notes'}.pdf`
  doc.save(filename)
}

function NotesPage() {
  const pushToast = useAppStore((state) => state.pushToast)
  const [notes, setNotes] = useState(readStoredNotes)

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...notes, updatedAt: new Date().toISOString() }),
      )
    }, 400)
    return () => clearTimeout(timer)
  }, [notes])

  const handleExportPdf = useCallback(() => {
    try {
      exportNotesToPdf(notes)
      pushToast({ title: 'PDF downloaded', description: 'Your notes were saved as a PDF.' })
    } catch (error) {
      pushToast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Could not create PDF.',
      })
    }
  }, [notes, pushToast])

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Card>
        <h1 className="text-xl font-semibold">Notes</h1>
        <p className="mt-1 text-sm text-slate-400">
          Draft notes are saved automatically in this browser. Export to PDF anytime.
        </p>
        <label className="mt-4 block">
          <span className="mb-1 block text-sm text-slate-300">Title</span>
          <input
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={notes.title}
            onChange={(event) => setNotes((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="Meeting notes, sprint ideas…"
          />
        </label>
        <label className="mt-4 block">
          <span className="mb-1 block text-sm text-slate-300">Notes</span>
          <textarea
            className="min-h-[320px] w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm leading-relaxed outline-none focus:border-blue-500"
            value={notes.body}
            onChange={(event) => setNotes((prev) => ({ ...prev, body: event.target.value }))}
            placeholder="Write your notes here…"
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" onClick={handleExportPdf}>
            Save as PDF
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setNotes({ title: '', body: '' })
              localStorage.removeItem(STORAGE_KEY)
              pushToast({ title: 'Notes cleared' })
            }}
          >
            Clear
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default NotesPage
