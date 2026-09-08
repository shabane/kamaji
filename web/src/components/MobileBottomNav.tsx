import React from 'react'
import { Activity, Server, BarChart3, Settings } from 'lucide-react'

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
        onClick={() => setActiveTab('matrix')}
        className={`flex flex-col items-center gap-1 text-[10px] font-mono transition-colors ${
          activeTab === 'matrix' ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <Server className="w-4 h-4" />
        <span>NODES</span>
      </button>

      <button
        onClick={() => setActiveTab('metrics')}
        className={`flex flex-col items-center gap-1 text-[10px] font-mono transition-colors ${
          activeTab === 'metrics' ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <BarChart3 className="w-4 h-4" />
        <span>METRICS</span>
      </button>

      <button
        onClick={() => setActiveTab('logs')}
        className={`flex flex-col items-center gap-1 text-[10px] font-mono transition-colors ${
          activeTab === 'logs' ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <Settings className="w-4 h-4" />
        <span>SETTINGS</span>
      </button>
    </div>
  )
}
