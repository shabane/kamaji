import React, { useState, useMemo } from 'react'
import { Globe, MapPin, Zap, Radio, ArrowRight, X } from 'lucide-react'
import { ProxyNode } from '../lib/types'
import { COUNTRY_COORDINATES, COUNTRY_NAMES, getCountryFlag } from '../lib/countries'

interface WorldMapProps {
  nodes: ProxyNode[]
  onSelectCountry: (countryCode: string) => void
  activeCountryFilter: string
}

interface CountryCluster {
  code: string
  name: string
  flag: string
  continent: string
  x: number
  y: number
  total: number
  online: number
  failed: number
  fastestLatency: number | null
}

export const WorldMap: React.FC<WorldMapProps> = ({
  nodes,
  onSelectCountry,
  activeCountryFilter,
}) => {
  const [hoveredCountry, setHoveredCountry] = useState<CountryCluster | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  // Aggregate nodes by country
  const { clusters, continentStats, topCountries } = useMemo(() => {
    const map = new Map<string, CountryCluster>()
    const continents: Record<string, number> = {
      Europe: 0,
      'North America': 0,
      Asia: 0,
      'South America': 0,
      Africa: 0,
      Oceania: 0,
    }

    nodes.forEach((node) => {
      const code = node.countryCode?.toUpperCase()
      if (!code || code === 'UN' || code === 'NONE') return

      const coord = COUNTRY_COORDINATES[code]
      if (!coord) return

      if (!map.has(code)) {
        map.set(code, {
          code,
          name: COUNTRY_NAMES[code] || node.countryName || code,
          flag: getCountryFlag(code),
          continent: coord.continent,
          x: coord.x,
          y: coord.y,
          total: 0,
          online: 0,
          failed: 0,
          fastestLatency: null,
        })
      }

      const cluster = map.get(code)!
      cluster.total++
      if (node.status === 'success' || node.status === 'warning') {
        cluster.online++
        if (node.latency !== null) {
          if (cluster.fastestLatency === null || node.latency < cluster.fastestLatency) {
            cluster.fastestLatency = node.latency
          }
        }
      } else if (node.status === 'failed') {
        cluster.failed++
      }

      if (coord.continent && continents[coord.continent] !== undefined) {
        continents[coord.continent]++
      }
    })

    const clusterList = Array.from(map.values())
    const sortedTop = [...clusterList].sort((a, b) => b.total - a.total).slice(0, 6)

    return {
      clusters: clusterList,
      continentStats: continents,
      topCountries: sortedTop,
    }
  }, [nodes])

  // Helper to calculate hexagon SVG points
  const getHexagonPoints = (cx: number, cy: number, r: number) => {
    const points: string[] = []
    for (let i = 0; i < 6; i++) {
      const angle = (60 * i - 30) * (Math.PI / 180)
      const x = (cx + r * Math.cos(angle)).toFixed(1)
      const y = (cy + r * Math.sin(angle)).toFixed(1)
      points.push(`${x},${y}`)
    }
    return points.join(' ')
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>, cluster: CountryCluster) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setHoveredCountry(cluster)
  }

  return (
    <div className="space-y-4">
      {/* Top Banner with Active Filter */}
      {activeCountryFilter && (
        <div className="flex items-center justify-between p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-xs font-mono text-cyan-300">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>
              Filtered by: <strong>{getCountryFlag(activeCountryFilter)} {COUNTRY_NAMES[activeCountryFilter] || activeCountryFilter}</strong>
            </span>
          </div>
          <button
            onClick={() => onSelectCountry('')}
            className="flex items-center gap-1 px-2 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filter</span>
          </button>
        </div>
      )}

      {/* Main Map Card */}
      <div className="glass-panel p-4 rounded-2xl border border-white/[0.06] relative overflow-hidden">
        {/* Map Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span className="font-heading font-bold text-sm text-white">
              Global Node Distribution Matrix
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              {clusters.length} Regions Active
            </span>
          </div>

          <div className="text-xs font-mono text-slate-400 flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Low Ping / Online</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>Standby Node</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>Unreachable</span>
            </span>
          </div>
        </div>

        {/* SVG World Map Viewport */}
        <div className="relative w-full aspect-[2/1] bg-[#070b13] rounded-xl border border-white/[0.04] overflow-hidden select-none">
          <svg
            viewBox="0 0 1000 500"
            className="w-full h-full"
            onMouseLeave={() => setHoveredCountry(null)}
          >
            {/* Background Grid Lines */}
            <g stroke="rgba(255,255,255,0.03)" strokeWidth="0.75" strokeDasharray="4 4">
              <line x1="0" y1="125" x2="1000" y2="125" />
              <line x1="0" y1="250" x2="1000" y2="250" />
              <line x1="0" y1="375" x2="1000" y2="375" />
              <line x1="250" y1="0" x2="250" y2="500" />
              <line x1="500" y1="0" x2="500" y2="500" />
              <line x1="750" y1="0" x2="750" y2="500" />
            </g>

            {/* Stylized Landmass Silhouettes */}
            <g fill="#0e1524" stroke="#192338" strokeWidth="0.75" opacity="0.85">
              {/* North America */}
              <path d="M 120 70 L 290 70 L 320 120 L 290 180 L 220 220 L 190 260 L 170 230 L 110 180 Z" />
              {/* Greenland */}
              <path d="M 330 40 L 410 40 L 390 85 L 340 85 Z" />
              {/* South America */}
              <path d="M 260 270 L 330 270 L 380 340 L 320 440 L 280 440 L 260 340 Z" />
              {/* Europe */}
              <path d="M 460 80 L 580 80 L 590 140 L 560 190 L 460 190 L 450 130 Z" />
              {/* Scandinavia */}
              <path d="M 490 60 L 560 60 L 550 110 L 490 110 Z" />
              {/* Africa */}
              <path d="M 460 200 L 590 200 L 610 280 L 550 390 L 490 380 L 450 270 Z" />
              {/* Asia / Eurasia */}
              <path d="M 590 70 L 890 70 L 880 190 L 820 270 L 710 270 L 670 210 L 590 190 Z" />
              {/* India */}
              <path d="M 680 210 L 740 210 L 710 290 Z" />
              {/* Southeast Asia & Islands */}
              <path d="M 750 250 L 820 250 L 850 330 L 760 330 Z" />
              {/* Australia */}
              <path d="M 790 320 L 910 320 L 890 410 L 810 410 Z" />
              {/* Japan */}
              <path d="M 860 140 L 885 140 L 870 200 L 850 180 Z" />
            </g>

            {/* Hexagon Country Nodes */}
            {clusters.map((cluster) => {
              // Scale radius based on total nodes count (range 8 - 18)
              const radius = Math.min(18, Math.max(8, Math.round(7 + Math.log2(cluster.total + 1) * 2.2)))
              const isSelected = activeCountryFilter === cluster.code
              const hasOnline = cluster.online > 0
              const isFailed = cluster.online === 0 && cluster.failed > 0

              // Color mapping
              const fillColor = hasOnline
                ? '#00f2fe'
                : isFailed
                ? '#ef4444'
                : '#818cf8'

              const strokeColor = hasOnline
                ? '#10b981'
                : isFailed
                ? '#f87171'
                : '#6366f1'

              return (
                <g
                  key={cluster.code}
                  className="cursor-pointer transition-transform duration-150 group"
                  onClick={() => onSelectCountry(cluster.code)}
                  onMouseMove={(e) => handleMouseMove(e, cluster)}
                >
                  {/* Outer Pulsing Aura for active nodes */}
                  {hasOnline && (
                    <circle
                      cx={cluster.x}
                      cy={cluster.y}
                      r={radius + 6}
                      fill="rgba(0, 242, 254, 0.15)"
                      className="animate-pulse-subtle"
                    />
                  )}

                  {/* Selected ring */}
                  {isSelected && (
                    <circle
                      cx={cluster.x}
                      cy={cluster.y}
                      r={radius + 8}
                      fill="none"
                      stroke="#00f2fe"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Geometric Hexagon Marker */}
                  <polygon
                    points={getHexagonPoints(cluster.x, cluster.y, radius)}
                    fill={fillColor}
                    fillOpacity={hasOnline ? 0.75 : 0.45}
                    stroke={strokeColor}
                    strokeWidth="1.5"
                    className="transition-all hover:scale-125 hover:fill-opacity-100"
                  />

                  {/* Inner Node Dot */}
                  <circle
                    cx={cluster.x}
                    cy={cluster.y}
                    r={cluster.total > 50 ? 3 : 2}
                    fill="#ffffff"
                  />
                </g>
              )
            })}
          </svg>

          {/* Floating Interactive Tooltip */}
          {hoveredCountry && (
            <div
              className="absolute pointer-events-none z-30 transform -translate-x-1/2 -translate-y-full mb-3"
              style={{
                left: `${(hoveredCountry.x / 1000) * 100}%`,
                top: `${(hoveredCountry.y / 500) * 100}%`,
              }}
            >
              <div className="glass-panel p-2.5 rounded-xl border border-cyan-500/30 shadow-2xl text-xs font-mono w-48 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-base">{hoveredCountry.flag}</span>
                  <span className="font-heading font-bold text-white text-xs truncate">
                    {hoveredCountry.name}
                  </span>
                  <span className="text-[10px] text-cyan-400 font-bold">
                    {hoveredCountry.code}
                  </span>
                </div>

                <div className="pt-1 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Endpoints:</span>
                  <span className="font-bold text-white">{hoveredCountry.total}</span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Online:</span>
                  <span className="font-bold text-emerald-400">{hoveredCountry.online}</span>
                </div>

                {hoveredCountry.fastestLatency !== null && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Fastest Ping:</span>
                    <span className="font-bold text-cyan-400">{hoveredCountry.fastestLatency} ms</span>
                  </div>
                )}

                <div className="pt-1 text-[10px] text-cyan-300/80 italic text-center">
                  Click to filter list
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Breakdown Panels: Top Countries & Continent Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-3 border-t border-white/[0.04]">
          {/* Top 6 Countries Bar */}
          <div className="md:col-span-2 space-y-2">
            <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
              Top Concentrations
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {topCountries.map((c) => (
                <button
                  key={c.code}
                  onClick={() => onSelectCountry(c.code)}
                  className={`flex items-center justify-between p-2 rounded-xl border text-xs font-mono transition-all text-left ${
                    activeCountryFilter === c.code
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                      : 'bg-[#080d16] border-white/[0.05] hover:border-white/[0.1] text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-sm">{c.flag}</span>
                    <span className="font-medium truncate">{c.name}</span>
                  </div>
                  <div className="text-right shrink-0 ml-1">
                    <span className="font-bold text-white">{c.total}</span>
                    {c.fastestLatency !== null && (
                      <span className="text-[10px] text-cyan-400 block">{c.fastestLatency}ms</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Continents Distribution */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
              Continents
            </span>
            <div className="bg-[#080d16] p-2.5 rounded-xl border border-white/[0.05] space-y-1.5 text-xs font-mono">
              {Object.entries(continentStats)
                .filter(([_, count]) => count > 0)
                .sort((a, b) => b[1] - a[1])
                .map(([continent, count]) => {
                  const percentage = nodes.length > 0 ? Math.round((count / nodes.length) * 100) : 0
                  return (
                    <div key={continent} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">{continent}</span>
                        <span className="text-slate-200 font-bold">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
