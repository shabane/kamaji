import React from 'react'
import { formatTime } from '../lib/utils'

interface ProgressBarProps {
  isRunning: boolean
  testedCount: number
  totalCount: number
  elapsedSeconds: number
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  isRunning,
  testedCount,
  totalCount,
  elapsedSeconds,
}) => {
  if (totalCount === 0) return null

  const percentage = Math.min(100, Math.round((testedCount / totalCount) * 100)) || 0
  const avgTimePerNode = testedCount > 0 ? elapsedSeconds / testedCount : 0
  const remainingNodes = Math.max(0, totalCount - testedCount)
  const etaSeconds = Math.round(remainingNodes * avgTimePerNode)

  return (
    <div className="space-y-1.5 py-1">
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="font-medium">
            Scanning Progress <span className="text-slate-400">({testedCount} / {totalCount} Nodes Tested)</span>
          </span>
        </div>

        <div className="text-slate-400 text-[11px]">
          {isRunning && remainingNodes > 0 ? (
            <span>ETA: ~{formatTime(etaSeconds)}</span>
          ) : (
            <span>Time: {formatTime(elapsedSeconds)}</span>
          )}
        </div>
      </div>

      {/* Ultra-slim smooth progress track */}
      <div className="w-full h-1.5 bg-[#0a0f19] rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isRunning ? 'bg-gradient-to-r from-cyan-400 to-emerald-400' : 'bg-cyan-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
