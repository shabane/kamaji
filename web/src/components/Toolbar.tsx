import React from 'react'
import { Search, Copy, Check, MoreHorizontal } from 'lucide-react'
import { FilterStatus, ProxyNode } from '../lib/types'

interface ToolbarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  statusFilter: FilterStatus
  setStatusFilter: (s: FilterStatus) => void
  nodes: ProxyNode[]
  onCopyWorking: () => void
  onDownloadTxt: () => void
  onCopyBase64: () => void
  isCopied: boolean
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  nodes,
  onCopyWorking,
  onDownloadTxt,
  onCopyBase64,
  isCopied,
}) => {
  const [showMore, setShowMore] = React.useState(false)
  const total = nodes.length
  const workingCount = nodes.filter((n) => n.status === 'success' || n.status === 'warning').length
  const failedCount = nodes.filter((n) => n.status === 'failed').length

  return (
    <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 p-2 bg-[#0a0f19] rounded-2xl border border-white/[0.06] backdrop-blur-md">
      {/* Left: Search input + [ Scanner | Matrix | Logs ] */}
      <div className="flex flex-wrap items-center gap-2 flex-1">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search nodes by country or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#070b13] border border-white/[0.05] focus:border-cyan-500/40 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none transition-colors"
          />
        </div>

        {/* View Switcher: Scanner | Matrix | Logs */}
        <div className="flex items-center bg-[#070b13] p-1 rounded-xl border border-white/[0.05] text-xs font-mono shrink-0">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'scanner'
                ? 'bg-white/[0.08] text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Scanner
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'matrix'
                ? 'bg-white/[0.08] text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Matrix
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'logs'
                ? 'bg-white/[0.08] text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Logs
          </button>
        </div>
      </div>

      {/* Right: Filter Tabs & Copy Button */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <div className="flex items-center bg-[#070b13] p-1 rounded-xl border border-white/[0.05] text-xs font-mono">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg transition-all ${
              statusFilter === 'all'
                ? 'bg-white/[0.08] text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({total})
          </button>
          <button
            onClick={() => setStatusFilter('working')}
            className={`px-3 py-1 rounded-lg transition-all ${
              statusFilter === 'working'
                ? 'bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30'
                : 'text-emerald-500/80 hover:text-emerald-400'
            }`}
          >
            Online ({workingCount})
          </button>
          <button
            onClick={() => setStatusFilter('failed')}
            className={`px-3 py-1 rounded-lg transition-all ${
              statusFilter === 'failed'
                ? 'bg-rose-500/20 text-rose-400 font-semibold border border-rose-500/30'
                : 'text-rose-400/80 hover:text-rose-400'
            }`}
          >
            Failed ({failedCount})
          </button>
        </div>

        {/* Primary Export Button */}
        <button
          onClick={onCopyWorking}
          disabled={workingCount === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:pointer-events-none text-slate-950 text-xs font-mono font-bold shadow-md shadow-emerald-400/20 transition-all active:scale-95 cursor-pointer"
        >
          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>Copy Working</span>
        </button>

        {/* More options (Download .txt / Base64) */}
        <div className="relative">
          <button
            onClick={() => setShowMore(!showMore)}
            className="p-2 rounded-xl bg-[#070b13] border border-white/[0.05] text-slate-400 hover:text-white transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMore && (
            <div className="absolute right-0 mt-1 w-40 bg-[#0c121e] border border-white/10 rounded-xl p-1 shadow-xl z-30 text-xs font-mono">
              <button
                onClick={() => {
                  onDownloadTxt()
                  setShowMore(false)
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/[0.05] text-slate-300"
              >
                Download .txt
              </button>
              <button
                onClick={() => {
                  onCopyBase64()
                  setShowMore(false)
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/[0.05] text-slate-300"
              >
                Copy Base64
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
