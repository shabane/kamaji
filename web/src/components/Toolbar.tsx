import React, { useState, useRef, useEffect } from 'react'
import { Search, Copy, Check, Download, Zap, Server, Shield, FileCode } from 'lucide-react'
import { FilterStatus, ProxyNode } from '../lib/types'

interface ToolbarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  statusFilter: FilterStatus
  setStatusFilter: (s: FilterStatus) => void
  protocolFilter: string
  setProtocolFilter: (p: string) => void
  securityFilter: string
  setSecurityFilter: (s: string) => void
  nodes: ProxyNode[]
  onCopyWorking: () => void
  onCopyTop5: () => void
  onCopyTop10: () => void
  onDownloadTxt: () => void
  onCopyBase64: () => void
  onDownloadClashYaml: () => void
  onDownloadSingboxJson: () => void
  onCopyClashYaml: () => void
  isCopied: boolean
  isCopiedTop5: boolean
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  protocolFilter,
  setProtocolFilter,
  securityFilter,
  setSecurityFilter,
  nodes,
  onCopyWorking,
  onCopyTop5,
  onCopyTop10,
  onDownloadTxt,
  onCopyBase64,
  onDownloadClashYaml,
  onDownloadSingboxJson,
  onCopyClashYaml,
  isCopied,
  isCopiedTop5,
}) => {
  const [showMore, setShowMore] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMore(false)
      }
    }

    if (showMore) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMore])

  const total = nodes.length
  const workingCount = nodes.filter((n) => n.status === 'success' || n.status === 'warning').length
  const failedCount = nodes.filter((n) => n.status === 'failed').length

  return (
    <div className={`p-2.5 bg-[#0a0f19] rounded-2xl border border-white/[0.06] backdrop-blur-md space-y-2.5 relative ${showMore ? 'z-40' : 'z-20'}`}>
      {/* Primary Row: Search + View Switcher + Filter Counts + Action Buttons */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
        {/* Left: Search input + View Switcher */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search nodes by country, host, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#070b13] border border-white/[0.05] focus:border-cyan-500/40 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none transition-colors"
            />
          </div>

          {/* View Switcher: Scanner | Map | Matrix | Logs */}
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
              onClick={() => setActiveTab('map')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'map'
                  ? 'bg-white/[0.08] text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Map
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

        {/* Right: Status Counts & Fast Actions */}
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

          {/* ⚡ Top 5 Fastest Copy Button */}
          <button
            onClick={onCopyTop5}
            disabled={workingCount === 0}
            className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:pointer-events-none text-slate-950 text-xs font-mono font-bold shadow-md shadow-amber-400/20 transition-all active:scale-95 cursor-pointer"
            title="Copy the 5 fastest verified online nodes to clipboard"
          >
            {isCopiedTop5 ? (
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            ) : (
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
            )}
            <span>{isCopiedTop5 ? 'Copied 5!' : 'Top 5'}</span>
          </button>

          {/* Primary Export Button */}
          <button
            onClick={onCopyWorking}
            disabled={workingCount === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:pointer-events-none text-slate-950 text-xs font-mono font-bold shadow-md shadow-emerald-400/20 transition-all active:scale-95 cursor-pointer"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Working</span>
          </button>

          {/* Enhanced Download / Export Dropdown */}
          <div className="relative z-50" ref={dropdownRef}>
            <button
              onClick={() => setShowMore(!showMore)}
              title="Export Options (Clash, Sing-box, .txt, Base64)"
              className="p-2 rounded-xl bg-[#070b13] hover:bg-white/[0.06] border border-white/[0.05] text-slate-400 hover:text-cyan-300 transition-colors flex items-center justify-center cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>

            {showMore && (
              <div className="absolute right-0 mt-1.5 w-60 bg-[#0c121e] border border-white/10 rounded-xl p-1.5 shadow-2xl z-50 text-xs font-mono divide-y divide-white/[0.06] animate-in fade-in zoom-in-95 duration-150">
                {/* Fast Selections */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      onCopyTop5()
                      setShowMore(false)
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/[0.05] text-amber-300 flex items-center justify-between cursor-pointer"
                  >
                    <span>⚡ Copy Top 5 Fastest</span>
                    <span className="text-[10px] text-slate-500 font-normal">Fastest</span>
                  </button>
                  <button
                    onClick={() => {
                      onCopyTop10()
                      setShowMore(false)
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/[0.05] text-amber-300 flex items-center justify-between cursor-pointer"
                  >
                    <span>⚡ Copy Top 10 Fastest</span>
                    <span className="text-[10px] text-slate-500 font-normal">Best 10</span>
                  </button>
                </div>

                {/* Client Config Profiles */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      onDownloadClashYaml()
                      setShowMore(false)
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/[0.05] text-cyan-300 flex items-center justify-between cursor-pointer"
                  >
                    <span>🐱 Clash Meta (.yaml)</span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-cyan-500/15 rounded text-cyan-400 font-bold">
                      Mihomo
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      onDownloadSingboxJson()
                      setShowMore(false)
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/[0.05] text-emerald-300 flex items-center justify-between cursor-pointer"
                  >
                    <span>📦 Sing-box (.json)</span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/15 rounded text-emerald-400 font-bold">
                      Hiddify
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      onCopyClashYaml()
                      setShowMore(false)
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/[0.05] text-slate-300 flex items-center justify-between cursor-pointer"
                  >
                    <span>📋 Copy Clash YAML</span>
                  </button>
                </div>

                {/* Raw Subscription Exports */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      onDownloadTxt()
                      setShowMore(false)
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/[0.05] text-slate-300 cursor-pointer"
                  >
                    📄 Download Raw .txt
                  </button>
                  <button
                    onClick={() => {
                      onCopyBase64()
                      setShowMore(false)
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/[0.05] text-slate-300 cursor-pointer"
                  >
                    🔐 Copy Base64 Sub
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Row: Protocol & Security Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 pt-1 text-xs font-mono border-t border-white/[0.04]">
        {/* Protocol Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-500 font-semibold mr-1 flex items-center gap-1">
            <Server className="w-3 h-3 text-cyan-400" /> Protocol:
          </span>
          {['all', 'vless', 'vmess', 'trojan'].map((p) => (
            <button
              key={p}
              onClick={() => setProtocolFilter(p)}
              className={`px-2.5 py-0.5 rounded-lg uppercase text-[11px] transition-all cursor-pointer ${
                protocolFilter === p
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 bg-white/[0.03]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Security Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-500 font-semibold mr-1 flex items-center gap-1">
            <Shield className="w-3 h-3 text-purple-400" /> Security:
          </span>
          {['all', 'tls', 'reality', 'none'].map((s) => (
            <button
              key={s}
              onClick={() => setSecurityFilter(s)}
              className={`px-2.5 py-0.5 rounded-lg uppercase text-[11px] transition-all cursor-pointer ${
                securityFilter === s
                  ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200 bg-white/[0.03]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
