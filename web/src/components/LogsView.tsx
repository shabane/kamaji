import React from 'react'
import { Terminal, Trash2, Download } from 'lucide-react'

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'success' | 'warn' | 'error'
  message: string
}

interface LogsViewProps {
  logs: LogEntry[]
  onClearLogs: () => void
}

export const LogsView: React.FC<LogsViewProps> = ({ logs, onClearLogs }) => {
  const downloadLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kamaji_probe_logs_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="glass-panel rounded-2xl p-4 flex flex-col gap-3 font-mono text-xs border border-white/[0.08]">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2 text-slate-200">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-bold">Prober Telemetry & Socket Logs</span>
          <span className="text-slate-500">({logs.length} entries)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadLogs}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 disabled:opacity-40 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
          <button
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 disabled:opacity-40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div className="h-[450px] overflow-y-auto space-y-1.5 pr-2 font-mono text-[11px]">
        {logs.length === 0 ? (
          <div className="text-slate-500 text-center py-20 italic">
            No telemetry logs yet. Start a latency test to see real-time WebSocket events.
          </div>
        ) : (
          logs.map((log) => {
            const levelColor =
              log.level === 'success'
                ? 'text-emerald-400'
                : log.level === 'warn'
                ? 'text-amber-400'
                : log.level === 'error'
                ? 'text-rose-400'
                : 'text-cyan-400'

            return (
              <div key={log.id} className="flex items-start gap-2 hover:bg-white/[0.02] p-1 rounded">
                <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                <span className={`font-bold uppercase text-[10px] shrink-0 w-14 ${levelColor}`}>
                  {log.level}
                </span>
                <span className="text-slate-300 break-all">{log.message}</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
