import React from 'react'
import { Link2, FileText, CheckCircle2, Shield } from 'lucide-react'
import { SourceTab } from '../lib/types'

interface SourceSelectorProps {
  currentSource: SourceTab
  onSelectSource: (source: SourceTab) => void
  totalCount: number
  lastSyncTime: string
}

export const SourceSelector: React.FC<SourceSelectorProps> = ({
  currentSource,
  onSelectSource,
  totalCount,
  lastSyncTime,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-2 bg-[#0c121e]/80 rounded-xl border border-white/[0.06] backdrop-blur-md">
      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
        <button
          onClick={() => onSelectSource('auto')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono transition-all ${
            currentSource === 'auto'
              ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Kamaji Auto-Feed <span className="opacity-60 text-[11px]">(hub/self/tested/best.txt)</span></span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/20">
            {totalCount} nodes
          </span>
        </button>

        <button
          onClick={() => onSelectSource('custom')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono transition-all ${
            currentSource === 'custom'
              ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
          }`}
        >
          <Link2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Custom Subscription URL</span>
        </button>

        <button
          onClick={() => onSelectSource('raw')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono transition-all ${
            currentSource === 'raw'
              ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>Raw Textarea Paste</span>
        </button>
      </div>

      {/* Sync Status Badge */}
      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 px-3 py-1 bg-black/20 rounded-lg border border-white/[0.04]">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>Sync: <span className="text-slate-200">{lastSyncTime}</span></span>
        <span className="opacity-40">•</span>
        <span className="opacity-75">SHA-256: <span className="text-slate-300">e83f...c24a</span></span>
      </div>
    </div>
  )
}
