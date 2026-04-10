import { useEffect, useState } from 'react'
import Card from '../components/ui/Card'
import { fetchUploadedFiles } from '../services/chatService'
import Skeleton from '../components/ui/Skeleton'

const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FilesPage() {
  const [loading, setLoading] = useState(true)
  const [files, setFiles] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchUploadedFiles()
      .then((result) => {
        if (!cancelled) {
          setFiles(Array.isArray(result) ? result : [])
          setError(null)
        }
      })
      .catch(() => {
        if (!cancelled) setError('Could not load files from the server.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Card>
      <h1 className="text-lg font-semibold">Shared Files</h1>
      <p className="mt-1 text-sm text-slate-400">
        Files uploaded in chat are stored on the server. Open a link in a new tab to download.
      </p>
      {loading ? (
        <div className="mt-4 space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : error ? (
        <p className="mt-4 text-sm text-rose-300">{error}</p>
      ) : files.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">
          No uploads yet. Share a file from a chat room to see it here.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {files.map((file) => {
            const href = file.url?.startsWith('/')
              ? `${API_BASE}${file.url}`
              : file.url
            const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(file.name || '')
            return (
              <article key={file.id} className="rounded-xl border border-slate-800 p-3">
                {isImage && (
                  <a href={href} target="_blank" rel="noreferrer" className="mb-2 block">
                    <img src={href} alt="" className="h-28 w-full rounded-lg object-cover" />
                  </a>
                )}
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-blue-300 underline-offset-2 hover:underline"
                >
                  {file.name}
                </a>
                <p className="text-xs text-slate-400">
                  {new Date(file.uploadedAt).toLocaleString()} · {formatSize(file.size || 0)}
                </p>
              </article>
            )
          })}
        </div>
      )}
    </Card>
  )
}

export default FilesPage
