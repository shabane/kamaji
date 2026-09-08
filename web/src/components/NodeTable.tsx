import React, { useState } from 'react'
import { Check, Copy, QrCode, RotateCcw, AlertTriangle, XCircle, CheckCircle2, Radio } from 'lucide-react'
import { ProxyNode } from '../lib/types'

interface NodeTableProps {
  nodes: ProxyNode[]
  onRetest: (node: ProxyNode) => void
  onOpenQr: (node: ProxyNode) => void
}

export const NodeTable: React.FC<NodeTableProps> = ({ nodes, onRetest, onOpenQr }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (id: string, link: string) => {
    navigator.clipboard.writeText(link)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-white/[0.08]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#090e18] text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/[0.06]">
            <tr>
              <th className="py-3 px-4">Node / Country</th>
              <th className="py-3 px-4">Protocol</th>
              <th className="py-3 px-4">Host:Port</th>
              <th className="py-3 px-4">Path</th>
              <th className="py-3 px-4">Status / Latency</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {nodes.map((node) => (
              <tr
                key={node.id}
                className="hover:bg-white/[0.02] transition-colors group"
              >
                {/* Node Title & Country */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{node.flag}</span>
                    <div className="truncate max-w-[220px]">
                      <div className="text-white font-medium truncate">{node.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{node.countryName}</div>
                    </div>
                  </div>
                </td>

                {/* Protocol */}
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${
                      node.protocol === 'vless'
                        ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                        : node.protocol === 'vmess'
                        ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                    }`}
                  >
                    {node.protocol}-ws
                  </span>
                </td>

                {/* Host & Port */}
                <td className="py-3 px-4 text-slate-300">
                  <div className="truncate max-w-[180px]" title={node.sni || node.host}>
                    {node.sni || node.host}:{node.port}
                  </div>
                </td>

                {/* Path */}
                <td className="py-3 px-4 text-cyan-400/80">
                  <div className="truncate max-w-[120px]">{node.path}</div>
                </td>

                {/* Status & Latency */}
                <td className="py-3 px-4">
                  {node.status === 'success' && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {node.latency} ms
                    </span>
                  )}
                  {node.status === 'warning' && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <AlertTriangle className="w-3 h-3" />
                      {node.latency} ms
                    </span>
                  )}
                  {node.status === 'failed' && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <XCircle className="w-3 h-3" />
                      {node.failReason || 'Failed'}
                    </span>
                  )}
                  {node.status === 'probing' && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse">
                      <Radio className="w-3 h-3" />
                      Testing...
                    </span>
                  )}
                  {node.status === 'pending' && (
                    <span className="text-slate-500 text-xs">Queued</span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onRetest(node)}
                      title="Retest"
                      className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenQr(node)}
                      title="QR Code"
                      className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleCopy(node.id, node.rawLink)}
                      title="Copy Link"
                      className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 transition-colors"
                    >
                      {copiedId === node.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
