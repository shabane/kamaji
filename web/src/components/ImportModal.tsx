import React, { useState } from 'react'
import { X, Link2, FileText, Download } from 'lucide-react'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportUrl: (url: string) => Promise<void>
  onImportRaw: (text: string) => void
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportUrl,
  onImportRaw,
}) => {
  const [tab, setTab] = useState<'url' | 'raw'>('url')
  const [urlInput, setUrlInput] = useState('')
  const [rawInput, setRawInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!urlInput.trim()) return

    setLoading(true)
    setError(null)
    try {
      await onImportUrl(urlInput.trim())
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to fetch subscription URL.')
    } finally {
      setLoading(false)
    }
  }

  const handleRawSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rawInput.trim()) return

    onImportRaw(rawInput.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel p-6 rounded-2xl max-w-lg w-full border border-white/10 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-heading font-bold text-lg text-white mb-1">
          Import Subscription
        </h3>
        <p className="text-xs font-mono text-slate-400 mb-4">
          Load external proxies to test WebSocket latency in your browser.
        </p>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-[#080c14] p-1 rounded-xl border border-white/[0.06] mb-4 text-xs font-mono">
          <button
            onClick={() => setTab('url')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
              tab === 'url'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Subscription URL</span>
          </button>
          <button
            onClick={() => setTab('raw')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
              tab === 'raw'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Raw Text / Base64</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}

        {tab === 'url' ? (
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                HTTP/HTTPS Subscription Link
              </label>
              <input
                type="url"
                required
                placeholder="https://raw.githubusercontent.com/.../sub.txt"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full bg-[#080c14] border border-white/[0.08] focus:border-cyan-500/50 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs shadow-md shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{loading ? 'Fetching URL...' : 'Fetch & Load Nodes'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleRawSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                Paste VLESS, VMess, or Trojan Links (one per line)
              </label>
              <textarea
                rows={6}
                required
                placeholder="vless://...&#10;vmess://...&#10;trojan://..."
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                className="w-full bg-[#080c14] border border-white/[0.08] focus:border-cyan-500/50 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs shadow-md shadow-cyan-500/20 transition-all active:scale-95"
            >
              <span>Parse & Add Nodes</span>
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
