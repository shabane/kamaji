import React, { useState } from 'react'
import { Check, Copy, AlertTriangle, QrCode, ExternalLink } from 'lucide-react'
import { ProxyNode } from '../lib/types'

interface NodeCardProps {
  node: ProxyNode
  onRetest: (node: ProxyNode) => void
  onOpenQr: (node: ProxyNode) => void
}

export const NodeCard: React.FC<NodeCardProps> = ({ node, onRetest, onOpenQr }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(node.rawLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Sparkline SVG generator
  const renderSparkline = (points: number[], color: string) => {
    if (!points || points.length < 2) return null
    const min = Math.min(...points)
    const max = Math.max(...points)
    const range = max - min || 1
    const width = 80
    const height = 18

    const svgPoints = points
      .map((val, idx) => {
        const x = (idx / (points.length - 1)) * width
        const y = height - ((val - min) / range) * (height - 6) - 3
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={svgPoints}
        />
      </svg>
    )
  }

  return (
    <div className="bg-[#0a0f19] rounded-2xl p-4 border border-white/[0.05] hover:border-white/[0.1] transition-all flex flex-col justify-between gap-3 text-xs font-mono group">
      {/* Top row: Flag, Name, Protocol Tag */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 truncate">
          <span className="text-base shrink-0">{node.flag}</span>
          <div className="truncate">
            <a
              href={node.rawLink}
              title="Open directly in VPN app (v2rayNG, NekoBox...)"
              className="font-heading font-bold text-sm text-white truncate hover:text-cyan-300 transition-colors flex items-center gap-1 group-hover:text-cyan-300"
            >
              <span className="truncate">{node.title}</span>
              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 opacity-70 group-hover:opacity-100 transition-all shrink-0" />
            </a>
            <p className="text-[11px] text-slate-500 truncate">
              {node.countryName} • {node.sni || node.host}
            </p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-white/[0.04] text-slate-300 border border-white/[0.06] shrink-0">
          {node.protocol}
        </span>
      </div>

      {/* Middle row: Latency & Sparkline */}
      <div className="flex items-center justify-between py-1">
        {node.status === 'success' && (
          <>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-sm font-bold text-emerald-400 font-heading">
                {node.latency} ms
              </span>
            </div>
            {renderSparkline(node.sparkline, '#10b981')}
          </>
        )}

        {node.status === 'warning' && (
          <>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-sm font-bold text-amber-400 font-heading">
                {node.latency} ms
              </span>
            </div>
            {renderSparkline(node.sparkline, '#f59e0b')}
          </>
        )}

        {node.status === 'failed' && (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-rose-400">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span className="font-bold">Timeout</span>
            </div>
            <span className="text-[11px] text-slate-500">
              Dropped
            </span>
          </div>
        )}

        {node.status === 'probing' && (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-bold">Testing...</span>
            </div>
            <span className="text-[11px] text-cyan-400/80">Probing</span>
          </div>
        )}

        {node.status === 'pending' && (
          <div className="flex items-center gap-2 text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span>Queued</span>
          </div>
        )}
      </div>

      {/* Bottom row: Status & Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
        {/* Left Status Tag */}
        <div>
          {node.status === 'success' && (
            <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
              ✓ Online
            </span>
          )}
          {node.status === 'warning' && (
            <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1">
              ⚠ High Jitter
            </span>
          )}
          {node.status === 'failed' && (
            <span className="text-[11px] font-medium text-rose-400/90 flex items-center gap-1">
              ⊗ Offline
            </span>
          )}
          {node.status === 'probing' && (
            <span className="text-[11px] font-medium text-cyan-400 flex items-center gap-1">
              📡 In Progress
            </span>
          )}
          {node.status === 'pending' && (
            <span className="text-[11px] text-slate-500">
              Pending
            </span>
          )}
        </div>

        {/* Right Actions: Open in App, QR & Copy */}
        <div className="flex items-center gap-1">
          <a
            href={node.rawLink}
            title="Open in VPN app (v2rayNG, NekoBox...)"
            className="p-1 rounded-lg text-slate-500 hover:text-cyan-300 hover:bg-white/[0.04] transition-colors flex items-center justify-center"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => onOpenQr(node)}
            title="QR Code"
            className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 text-[11px] border border-white/[0.05] transition-all active:scale-95"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>Copy</span>
          </button>
        </div>
      </div>
    </div>
  )
}
