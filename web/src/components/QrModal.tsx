import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { X, Copy, Check } from 'lucide-react'
import { ProxyNode } from '../lib/types'

interface QrModalProps {
  node: ProxyNode | null
  onClose: () => void
}

export const QrModal: React.FC<QrModalProps> = ({ node, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!node) {
      setQrDataUrl(null)
      return
    }

    QRCode.toDataURL(node.rawLink, {
      width: 280,
      margin: 2,
      color: {
        dark: '#080c14',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code generation failed', err))
  }, [node])

  if (!node) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(node.rawLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel p-6 rounded-2xl max-w-sm w-full border border-white/10 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-4">
          <div className="text-2xl mb-1">{node.flag}</div>
          <h3 className="font-heading font-bold text-base text-white truncate px-6">
            {node.title}
          </h3>
          <p className="text-xs font-mono text-cyan-400 uppercase mt-0.5">
            {node.protocol}-WS • {node.countryName}
          </p>
        </div>

        {/* QR Code Canvas / Image */}
        <div className="bg-white p-3 rounded-xl flex items-center justify-center mx-auto w-fit shadow-inner">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code" className="w-64 h-64 rounded" />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center text-xs font-mono text-slate-500">
              Generating QR Code...
            </div>
          )}
        </div>

        <p className="text-[11px] font-mono text-slate-400 text-center mt-3">
          Scan with NekoBox, v2rayNG, or your preferred client.
        </p>

        {/* Copy raw link button */}
        <button
          onClick={handleCopy}
          className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs shadow-md shadow-cyan-500/20 transition-all active:scale-95"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Link Copied!' : 'Copy Config URI'}</span>
        </button>
      </div>
    </div>
  )
}
