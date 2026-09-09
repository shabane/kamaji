import React, { useState } from 'react'
import { Play, Pause, RotateCw, SlidersHorizontal } from 'lucide-react'
import { SourceTab } from '../lib/types'

interface ControlBarProps {
  isRunning: boolean
  onToggleTest: () => void
  onReload: () => void
  currentSource: SourceTab
  onSelectSource: (s: SourceTab) => void
  totalCount: number
  lastSyncTime: string
  concurrency: number
  setConcurrency: (c: number) => void
  timeoutSec: number
  setTimeoutSec: (t: number) => void
  probeCount: number
  setProbeCount: (p: number) => void
}

export const ControlBar: React.FC<ControlBarProps> = ({
  isRunning,
  onToggleTest,
  onReload,
  currentSource,
  onSelectSource,
  totalCount,
  lastSyncTime,
  concurrency,
  setConcurrency,
  timeoutSec,
  setTimeoutSec,
  probeCount,
  setProbeCount,
}) => {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 bg-[#0a0f19] rounded-2xl border border-white/[0.06] backdrop-blur-md">
        {/* Left CTA & Source Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onToggleTest}
            disabled={totalCount === 0}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-heading font-bold text-xs tracking-wide transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 ${
              isRunning
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-cyan-400/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-slate-950" />
                <span>Pause Probe</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Run Latency Probe</span>
              </>
            )}
          </button>

          {/* Sources Pills */}
          <div className="flex items-center bg-[#070b13] p-1 rounded-xl border border-white/[0.05] text-xs font-mono">
            <button
              onClick={() => onSelectSource('auto')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                currentSource === 'auto'
                  ? 'bg-white/[0.08] text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Auto Feed ({totalCount})
            </button>
            <button
              onClick={() => onSelectSource('custom')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                currentSource === 'custom'
                  ? 'bg-white/[0.08] text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Custom URL
            </button>
          </div>
        </div>

        {/* Right: Sync status, reload & settings */}
        <div className="flex items-center justify-end gap-2 text-xs font-mono text-slate-400">
          <button
            onClick={onReload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/[0.04] transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px]">Synced {lastSyncTime}</span>
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            title="Tuning Settings"
            className={`p-2 rounded-xl transition-colors ${
              showSettings ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-white/[0.04] text-slate-400'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expandable Subtle Settings Panel */}
      {showSettings && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-[#080d16] rounded-xl border border-white/[0.05] text-xs font-mono animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-[11px] font-semibold uppercase">Threads:</span>
            <div className="flex items-center gap-1">
              {[5, 10, 20, 50].map((t) => (
                <button
                  key={t}
                  onClick={() => setConcurrency(t)}
                  className={`px-2 py-0.5 rounded text-xs transition-colors ${
                    concurrency === t
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white bg-white/[0.03]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-[11px] font-semibold uppercase">Timeout:</span>
            <div className="flex items-center gap-1">
              {[2.5, 3.5, 5.0].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setTimeoutSec(sec)}
                  className={`px-2 py-0.5 rounded text-xs transition-colors ${
                    timeoutSec === sec
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white bg-white/[0.03]'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-[11px] font-semibold uppercase">Mode:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setProbeCount(1)}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  probeCount === 1
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white bg-white/[0.03]'
                }`}
                title="Fast single WebSocket handshake"
              >
                ⚡ Fast (1x)
              </button>
              <button
                onClick={() => setProbeCount(3)}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  probeCount === 3
                    ? 'bg-emerald-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white bg-white/[0.03]'
                }`}
                title="3 sequential pings to measure true packet loss and jitter"
              >
                🎯 Deep Stability (3x)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
