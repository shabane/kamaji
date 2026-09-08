import React from 'react'
import { ProxyNode } from '../lib/types'

interface MetricCardsProps {
  nodes: ProxyNode[]
}

export const MetricCards: React.FC<MetricCardsProps> = ({ nodes }) => {
  const total = nodes.length
  const onlineNodes = nodes.filter((n) => n.status === 'success' || n.status === 'warning')
  const failedNodes = nodes.filter((n) => n.status === 'failed')

  const fastestNode = onlineNodes.reduce<ProxyNode | null>((fastest, curr) => {
    if (curr.latency === null) return fastest
    if (!fastest || fastest.latency === null || curr.latency < fastest.latency) {
      return curr
    }
    return fastest
  }, null)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Card 1: Total Endpoints */}
      <div className="bg-[#0a0f19] p-4 rounded-2xl border border-white/[0.05] flex flex-col justify-between">
        <span className="text-[10px] font-mono tracking-wider text-slate-400 font-semibold uppercase">
          TOTAL ENDPOINTS
        </span>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-heading font-bold text-white tracking-tight">
            {total}
          </span>
          <span className="text-xs font-mono text-slate-400">Loaded</span>
        </div>
      </div>

      {/* Card 2: Online */}
      <div className="bg-[#0a0f19] p-4 rounded-2xl border border-white/[0.05] flex flex-col justify-between">
        <span className="text-[10px] font-mono tracking-wider text-emerald-400 font-semibold uppercase">
          ONLINE
        </span>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-heading font-bold text-emerald-400 tracking-tight">
            {onlineNodes.length}
          </span>
          <span className="text-xs font-mono text-emerald-500/90 font-medium">Active</span>
        </div>
      </div>

      {/* Card 3: Unreachable */}
      <div className="bg-[#0a0f19] p-4 rounded-2xl border border-white/[0.05] flex flex-col justify-between">
        <span className="text-[10px] font-mono tracking-wider text-rose-400 font-semibold uppercase">
          UNREACHABLE
        </span>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-heading font-bold text-rose-400 tracking-tight">
            {failedNodes.length}
          </span>
          <span className="text-xs font-mono text-rose-400/80 font-medium">Timeout</span>
        </div>
      </div>

      {/* Card 4: Lowest Latency */}
      <div className="bg-[#0a0f19] p-4 rounded-2xl border border-white/[0.05] flex flex-col justify-between">
        <span className="text-[10px] font-mono tracking-wider text-cyan-400 font-semibold uppercase">
          LOWEST LATENCY
        </span>
        <div className="flex items-baseline gap-2 mt-2">
          {fastestNode && fastestNode.latency !== null ? (
            <>
              <span className="text-3xl font-heading font-bold text-cyan-400 tracking-tight">
                {fastestNode.latency}
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400/80">ms</span>
              <span className="text-xs font-mono text-slate-400 ml-1 truncate">
                {fastestNode.countryName}
              </span>
            </>
          ) : (
            <span className="text-2xl font-heading font-semibold text-slate-500">
              --
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
