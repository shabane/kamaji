import React from 'react'
import { Zap, Plus } from 'lucide-react'

interface NavbarProps {
  onOpenImport: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenImport }) => {
  return (
    <header className="border-b border-white/[0.05] bg-[#070b12]/90 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        {/* Brand & Engine Status */}
        <div className="flex items-center gap-3 shrink-0">
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
