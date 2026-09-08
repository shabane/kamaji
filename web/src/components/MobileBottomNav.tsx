import React from 'react'
import { Activity, Globe, Server, Terminal } from 'lucide-react'

interface MobileBottomNavProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070b12]/95 backdrop-blur-xl border-t border-white/[0.06] px-4 py-2 flex items-center justify-around">
      <button
        onClick={() => setActiveTab('scanner')}
        className={`flex flex-col items-center gap-1 text-[10px] font-mono transition-colors ${
          activeTab === 'scanner' ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <Activity className="w-4 h-4" />
        <span>SCAN</span>
      </button>

      <button
        onClick={() => setActiveTab('map')}
        className={`flex flex-col items-center gap-1 text-[10px] font-mono transition-colors ${
          activeTab === 'map' ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <Globe className="w-4 h-4" />
        <span>MAP</span>
      </button>

      <button
        onClick={() => setActiveTab('matrix')}
        className={`flex flex-col items-center gap-1 text-[10px] font-mono transition-colors ${
          activeTab === 'matrix' ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <Server className="w-4 h-4" />
        <span>NODES</span>
      </button>

      <button
        onClick={() => setActiveTab('logs')}
        className={`flex flex-col items-center gap-1 text-[10px] font-mono transition-colors ${
          activeTab === 'logs' ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <Terminal className="w-4 h-4" />
        <span>LOGS</span>
      </button>
    </div>
  )
}

