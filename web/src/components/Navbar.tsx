import React from 'react'
import { Zap, Plus } from 'lucide-react'

interface NavbarProps {
  onOpenImport: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenImport }) => {
  const [ispInfo, setIspInfo] = React.useState<{ isp: string; flag: string } | null>(() => {
    try {
      const cached = localStorage.getItem('kamaji_client_isp')
      if (cached) return JSON.parse(cached)
    } catch {}
    return null
  })

  React.useEffect(() => {
    // Background fetch client ISP / Network provider
    fetch('https://ipwho.is/')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) {
          const rawIsp = data.connection?.isp || data.connection?.org || ''
          let cleanIsp = rawIsp
          if (/irancell/i.test(rawIsp)) cleanIsp = 'Irancell'
          else if (/mobile communication company|mci/i.test(rawIsp)) cleanIsp = 'MCI'
          else if (/telecommunication company of iran|tci|mokhaberat/i.test(rawIsp)) cleanIsp = 'TCI'
          else if (/shatel/i.test(rawIsp)) cleanIsp = 'Shatel'
          else if (/rightel/i.test(rawIsp)) cleanIsp = 'Rightel'
          else if (/asiatech/i.test(rawIsp)) cleanIsp = 'Asiatech'
          else if (/pars online/i.test(rawIsp)) cleanIsp = 'ParsOnline'
          else if (/mobinnet/i.test(rawIsp)) cleanIsp = 'Mobinnet'
          else if (data.connection?.asn) cleanIsp = `AS${data.connection.asn}`
          else if (data.isp) cleanIsp = data.isp

          const info = {
            isp: cleanIsp.slice(0, 18),
            flag: data.flag?.emoji || '🌐',
          }
          setIspInfo(info)
          try {
            localStorage.setItem('kamaji_client_isp', JSON.stringify(info))
          } catch {}
        }
      })
      .catch(() => {})
  }, [])

  return (
    <header className="border-b border-white/[0.05] bg-[#070b12]/90 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        {/* Brand & Engine Status */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2 select-none">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center">
              <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
            </div>
            <span className="font-heading font-bold text-base tracking-tight text-white">
              Kamaji <span className="text-slate-400 font-normal text-sm">Probe</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Local Engine</span>
          </div>

          {ispInfo && (
            <div
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-mono text-cyan-300"
              title={`Detected Network Provider: ${ispInfo.isp}`}
            >
              <span>{ispInfo.flag}</span>
              <span className="font-semibold">{ispInfo.isp}</span>
            </div>
          )}
        </div>

        {/* Right Import Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenImport}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-mono font-bold shadow-md shadow-cyan-400/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Import</span>
          </button>
        </div>
      </div>
    </header>
  )
}
