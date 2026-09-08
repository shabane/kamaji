import React, { useState, useEffect, useMemo } from 'react'
import { Globe, MapPin, Zap, Radio, Search, X, Navigation, Compass, Sparkles } from 'lucide-react'
import { ProxyNode } from '../lib/types'
import {
  WORLD_HEX_COUNTRIES,
  WORLD_HEX_MAP_BY_CODE,
  WorldHexCountry,
  calcHexCenter,
  getHexagonPoints,
  calcArcControlPoint,
} from '../lib/worldHexMap'
import { getInitialClientOriginCountry, detectClientCountryFromTimezone } from '../lib/countries'

interface WorldMapProps {
  nodes: ProxyNode[]
  onSelectCountry: (countryCode: string) => void
  activeCountryFilter: string
}

interface CountryStats {
  total: number
  online: number
  failed: number
  fastestLatency: number | null
}

const HEX_RADIUS = 21
const HEX_DRAW_RADIUS = 19.6 // Crisp gap between adjacent hexagons
const OFFSET_X = 25
const OFFSET_Y = 15

export const WorldMap: React.FC<WorldMapProps> = ({
  nodes,
  onSelectCountry,
  activeCountryFilter,
}) => {
  const [hoveredCountry, setHoveredCountry] = useState<WorldHexCountry | null>(null)
  const [sourceCountryCode, setSourceCountryCode] = useState<string>(() => getInitialClientOriginCountry())
  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(() => !localStorage.getItem('kamaji_ping_origin'))
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isOriginDropdownOpen, setIsOriginDropdownOpen] = useState<boolean>(false)

  // Background refinement via lightweight geoIP if user hasn't explicitly set an origin override
  useEffect(() => {
    if (!localStorage.getItem('kamaji_ping_origin')) {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 2500)
      fetch('https://api.country.is/', { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => {
          clearTimeout(timer)
          if (data?.country && typeof data.country === 'string' && data.country.length === 2) {
            setSourceCountryCode(data.country.toUpperCase())
          }
        })
        .catch(() => {})
    }
  }, [])

  // Aggregate proxy nodes by country code
  const { nodeStatsByCountry, continentStats, topCountries } = useMemo(() => {
    const statsMap: Record<string, CountryStats> = {}
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

      if (!statsMap[code]) {
        statsMap[code] = {
          total: 0,
          online: 0,
          failed: 0,
          fastestLatency: null,
        }
      }

      const s = statsMap[code]
      s.total++
      if (node.status === 'success' || node.status === 'warning') {
        s.online++
        if (node.latency !== null) {
          if (s.fastestLatency === null || node.latency < s.fastestLatency) {
            s.fastestLatency = node.latency
          }
        }
      } else if (node.status === 'failed') {
        s.failed++
      }

      const hexData = WORLD_HEX_MAP_BY_CODE[code]
      if (hexData && continents[hexData.continent] !== undefined) {
        continents[hexData.continent]++
      }
    })

    const top = Object.entries(statsMap)
      .map(([code, stat]) => ({
        code,
        name: WORLD_HEX_MAP_BY_CODE[code]?.name || code,
        flag: WORLD_HEX_MAP_BY_CODE[code]?.flag || '🌐',
        ...stat,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6)

    return {
      nodeStatsByCountry: statsMap,
      continentStats: continents,
      topCountries: top,
    }
  }, [nodes])

  // Check whether user has started or performed latency analysis
  const testedCount = useMemo(() => {
    return nodes.filter(
      (n) => n.status === 'success' || n.status === 'warning' || n.status === 'failed'
    ).length
  }, [nodes])

  const hasAnalyzed = testedCount > 0

  // Determine current active target country for arc and glowing highlight
  const targetCountryCode = useMemo(() => {
    if (hoveredCountry) return hoveredCountry.code
    if (activeCountryFilter) return activeCountryFilter
    if (searchQuery.trim()) {
      const match = WORLD_HEX_COUNTRIES.find(
        (c) =>
          c.code.toLowerCase() === searchQuery.toLowerCase().trim() ||
          c.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
      if (match) return match.code
    }
    // Don't auto-target any node before user has run analysis
    if (!hasAnalyzed) return ''
    return topCountries.length > 0 ? topCountries[0].code : ''
  }, [hoveredCountry, activeCountryFilter, searchQuery, topCountries, hasAnalyzed])

  // Calculate coordinates for Ping Arc
  const arcPathData = useMemo(() => {
    if (!sourceCountryCode || !targetCountryCode || sourceCountryCode === targetCountryCode) {
      return null
    }
    const srcHex = WORLD_HEX_MAP_BY_CODE[sourceCountryCode]
    const dstHex = WORLD_HEX_MAP_BY_CODE[targetCountryCode]
    if (!srcHex || !dstHex) return null

    const srcCenter = calcHexCenter(srcHex.col, srcHex.row, HEX_RADIUS, OFFSET_X, OFFSET_Y)
    const dstCenter = calcHexCenter(dstHex.col, dstHex.row, HEX_RADIUS, OFFSET_X, OFFSET_Y)
    const ctrl = calcArcControlPoint(srcCenter.x, srcCenter.y, dstCenter.x, dstCenter.y)

    return {
      srcCenter,
      dstCenter,
      ctrl,
      path: `M ${srcCenter.x} ${srcCenter.y} Q ${ctrl.cx} ${ctrl.cy} ${dstCenter.x} ${dstCenter.y}`,
    }
  }, [sourceCountryCode, targetCountryCode])

  const hoveredStats = hoveredCountry ? nodeStatsByCountry[hoveredCountry.code] : null
  const hoveredCenter = hoveredCountry
    ? calcHexCenter(hoveredCountry.col, hoveredCountry.row, HEX_RADIUS, OFFSET_X, OFFSET_Y)
    : null

  return (
    <div className="space-y-4">
      {/* Active Country Filter Notification Banner */}
      {activeCountryFilter && (
        <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-mono text-amber-300 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>
              Target Filter Active:{' '}
              <strong className="text-white">
                {WORLD_HEX_MAP_BY_CODE[activeCountryFilter]?.flag}{' '}
                {WORLD_HEX_MAP_BY_CODE[activeCountryFilter]?.name || activeCountryFilter}
              </strong>
              {nodeStatsByCountry[activeCountryFilter] && (
                <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px]">
                  {nodeStatsByCountry[activeCountryFilter].total} nodes available
                </span>
              )}
            </span>
          </div>
          <button
            onClick={() => onSelectCountry('')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-white transition-all cursor-pointer text-xs font-medium"
          >
            <X className="w-3.5 h-3.5 text-amber-400" />
            <span>Clear Filter</span>
          </button>
        </div>
      )}

      {/* Pre-Analysis Locked Notice */}
      {!hasAnalyzed && (
        <div className="flex items-center justify-between p-3 bg-indigo-500/10 border border-indigo-500/25 rounded-xl text-xs font-mono text-indigo-300 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>
              Endpoints pending test: Click <strong>Run Latency Probe</strong> to analyze nodes and unlock interactive country filtering.
            </span>
          </div>
        </div>
      )}

      {/* Main Map Card */}
      <div className="glass-panel p-4 rounded-2xl border border-white/[0.08] relative overflow-hidden shadow-2xl bg-[#070d18]/90">
        {/* Header Controls: Title, Search, Origin Selector */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-amber-500/30 flex items-center justify-center">
              <Globe className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm text-white tracking-wide">
                  Global Hexagonal Cartogram
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/15 text-purple-300 border border-purple-500/25">
                  {WORLD_HEX_COUNTRIES.length} Countries
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Every hexagon represents a country • Interactive probe & latency flight path
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Search Country Input */}
            <div className="relative flex-1 sm:w-44">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find country..."
                className="w-full pl-8 pr-7 py-1.5 text-xs font-mono bg-[#0c1424] border border-white/[0.08] rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Ping Origin Selector */}
            <div className="relative">
              <button
                onClick={() => setIsOriginDropdownOpen((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c1424] border border-cyan-500/30 text-xs font-mono text-cyan-300 hover:border-cyan-400 transition-colors cursor-pointer"
                title="Change ping origin station"
              >
                <Navigation className="w-3 h-3 text-cyan-400" />
                <span>
                  Origin: {WORLD_HEX_MAP_BY_CODE[sourceCountryCode]?.flag} {sourceCountryCode}
                  {isAutoDetected && <span className="ml-1 text-[9px] text-cyan-400/80 font-normal">(Auto)</span>}
                </span>
              </button>

              {isOriginDropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-[#0b1322] border border-white/[0.1] rounded-xl shadow-2xl p-1.5 z-40 text-xs font-mono max-h-52 overflow-y-auto">
                  <div className="px-2 py-1 text-[10px] text-slate-400 border-b border-white/[0.05] mb-1">
                    Select Ping Station:
                  </div>

                  {/* Auto-detect button */}
                  <button
                    onClick={() => {
                      const detected = detectClientCountryFromTimezone()
                      setSourceCountryCode(detected)
                      setIsAutoDetected(true)
                      setIsOriginDropdownOpen(false)
                      try {
                        localStorage.removeItem('kamaji_ping_origin')
                      } catch {}
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 mb-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                      isAutoDetected
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                        : 'bg-white/[0.03] text-cyan-300/80 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Auto-Detect</span>
                    </span>
                    <span className="text-[10px]">
                      {WORLD_HEX_MAP_BY_CODE[detectClientCountryFromTimezone()]?.flag} {detectClientCountryFromTimezone()}
                    </span>
                  </button>

                  {['IR', 'US', 'DE', 'GB', 'FR', 'NL', 'SG', 'JP', 'TR', 'AE', 'AU', 'BR'].map((code) => {
                    const c = WORLD_HEX_MAP_BY_CODE[code]
                    if (!c) return null
                    return (
                      <button
                        key={code}
                        onClick={() => {
                          setSourceCountryCode(code)
                          setIsAutoDetected(false)
                          setIsOriginDropdownOpen(false)
                          try {
                            localStorage.setItem('kamaji_ping_origin', code)
                          } catch {}
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded-lg text-left transition-colors cursor-pointer ${
                          sourceCountryCode === code && !isAutoDetected
                            ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                            : 'text-slate-300 hover:bg-white/[0.06]'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <span>{c.flag}</span>
                          <span className="truncate">{c.name}</span>
                        </span>
                        <span className="text-[10px] opacity-60">{code}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Legend Markers */}
            <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-slate-400 pl-2 border-l border-white/[0.06]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
                <span className="text-amber-300 font-medium">Target</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                <span className="text-emerald-300">Online</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#321c56] border border-[#522a8c]" />
                <span>World</span>
              </span>
            </div>
          </div>
        </div>

        {/* SVG Viewport for Hex World Cartogram */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[1.65/1] bg-gradient-to-b from-[#070e1b] to-[#040810] rounded-xl border border-white/[0.04] overflow-hidden select-none">
          <svg
            viewBox="0 -50 980 620"
            className="w-full h-full"
            onMouseLeave={() => setHoveredCountry(null)}
          >
            <defs>
              {/* Glow Filters */}
              <filter id="glow-amber" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="glow-white" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="glow-emerald" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Subtle Longitude & Latitude Background Grid Lines */}
            <g stroke="rgba(255,255,255,0.02)" strokeWidth="1" strokeDasharray="3 6">
              <line x1="0" y1="100" x2="960" y2="100" />
              <line x1="0" y1="240" x2="960" y2="240" />
              <line x1="0" y1="380" x2="960" y2="380" />
              <line x1="220" y1="0" x2="220" y2="560" />
              <line x1="480" y1="0" x2="480" y2="560" />
              <line x1="740" y1="0" x2="740" y2="560" />
            </g>

            {/* Render Every Country as an Individual Hexagon */}
            {WORLD_HEX_COUNTRIES.map((country) => {
              const { x: cx, y: cy } = calcHexCenter(
                country.col,
                country.row,
                HEX_RADIUS,
                OFFSET_X,
                OFFSET_Y
              )
              const stats = nodeStatsByCountry[country.code]
              const hasNodes = !!stats && stats.total > 0
              const isOnline = hasNodes && stats.online > 0
              const isFailedOnly = hasNodes && stats.online === 0 && stats.failed > 0

              const isTarget = targetCountryCode === country.code
              const isSource = sourceCountryCode === country.code
              const isSelected = activeCountryFilter === country.code
              const isHovered = hoveredCountry?.code === country.code

              // Stylistic Color Scheme matching the reference image
              let fillColor = '#2e194f' // Deep purple base
              let strokeColor = '#472378' // Elegant dark violet border
              let strokeWidth = 1.2
              let textColor = 'rgba(255, 255, 255, 0.25)'

              if (isTarget) {
                // Target hexagon: Radiant Golden Amber (Exactly matching user's photo!)
                fillColor = '#f59e0b'
                strokeColor = '#fef08a'
                strokeWidth = 2.2
                textColor = '#0f172a'
              } else if (isSource) {
                // Origin hexagon: Deep cyan with bright border
                fillColor = '#0b3548'
                strokeColor = '#38bdf8'
                strokeWidth = 2
                textColor = '#38bdf8'
              } else if (isOnline) {
                // Countries with online proxy nodes: Neon Emerald border with deep forest background
                fillColor = '#06291d'
                strokeColor = '#10b981'
                strokeWidth = 1.8
                textColor = '#6ee7b7'
              } else if (isFailedOnly) {
                // Failed nodes only
                fillColor = '#341420'
                strokeColor = '#f43f5e'
                strokeWidth = 1.4
                textColor = '#fda4af'
              }

              const isClickable = hasAnalyzed && hasNodes

              return (
                <g
                  key={country.code}
                  className={`${isClickable ? 'cursor-pointer' : 'cursor-default'} transition-all duration-150 group`}
                  onClick={() => {
                    if (isClickable) {
                      onSelectCountry(country.code)
                    }
                  }}
                  onMouseEnter={() => setHoveredCountry(country)}
                >
                  {/* Outer Glowing Hexagon Ring for Selected / Target Node (matching photo) */}
                  {isTarget && (
                    <polygon
                      points={getHexagonPoints(cx, cy, HEX_DRAW_RADIUS + 4)}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="1.8"
                      strokeOpacity="0.8"
                      className="animate-hex-target"
                    />
                  )}

                  {/* Selected Filter Dashed Accent Ring */}
                  {isSelected && !isTarget && (
                    <polygon
                      points={getHexagonPoints(cx, cy, HEX_DRAW_RADIUS + 3)}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                      strokeDasharray="3 2"
                    />
                  )}

                  {/* Online Node Soft Radar Aura */}
                  {isOnline && !isTarget && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={HEX_DRAW_RADIUS + 2}
                      fill="rgba(16, 185, 129, 0.16)"
                    />
                  )}

                  {/* Base Flat-Topped Hexagon Tile */}
                  <polygon
                    points={getHexagonPoints(
                      cx,
                      cy,
                      isHovered ? HEX_DRAW_RADIUS + 1.2 : HEX_DRAW_RADIUS
                    )}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    className="transition-all duration-150 group-hover:brightness-125"
                  />

                  {/* Online Indicator Center Dot */}
                  {isOnline && !isTarget && (
                    <circle cx={cx} cy={cy + 7} r="2" fill="#10b981" filter="url(#glow-emerald)" />
                  )}

                  {/* 2-Letter Country Code */}
                  <text
                    x={cx}
                    y={isOnline && !isTarget ? cy + 1 : cy + 3.5}
                    textAnchor="middle"
                    fill={textColor}
                    fontSize={isTarget ? '10px' : hasNodes ? '9px' : '8px'}
                    fontFamily="monospace"
                    fontWeight={isTarget || hasNodes ? 'bold' : 'normal'}
                    className="select-none pointer-events-none"
                  >
                    {country.code}
                  </text>
                </g>
              )
            })}

            {/* Animated Flight / Ping Arc connecting Origin to Target (Matching Photo!) */}
            {arcPathData && (
              <g className="pointer-events-none">
                {/* Arc Shadow/Glow layer */}
                <path
                  d={arcPathData.path}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="4"
                  strokeOpacity="0.25"
                  filter="url(#glow-amber)"
                />

                {/* Main Dashed Animated Flight Trajectory */}
                <path
                  d={arcPathData.path}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2.2"
                  strokeDasharray="6 4"
                  className="animate-arc-flow"
                  filter="url(#glow-amber)"
                />

                {/* Source Ping Wave / Radar Circle */}
                <circle
                  cx={arcPathData.srcCenter.x}
                  cy={arcPathData.srcCenter.y}
                  r="6"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  className="animate-ping-radar"
                />

                {/* Source White Origin Dot (Exactly as seen in reference photo!) */}
                <circle
                  cx={arcPathData.srcCenter.x}
                  cy={arcPathData.srcCenter.y}
                  r="4"
                  fill="#ffffff"
                  filter="url(#glow-white)"
                />
              </g>
            )}
          </svg>

          {/* Floating Cyberpunk Tooltip */}
          {hoveredCountry && hoveredCenter && (
            <div
              className="absolute pointer-events-none z-30 transform -translate-x-1/2 -translate-y-full mb-3"
              style={{
                left: `${(hoveredCenter.x / 960) * 100}%`,
                top: `${((hoveredCenter.y - 15) / 560) * 100}%`,
              }}
            >
              <div className="glass-panel p-2.5 rounded-xl border border-amber-500/40 shadow-2xl text-xs font-mono w-48 space-y-1.5 animate-in fade-in zoom-in-95 duration-100 bg-[#0c1424]/95">
                <div className="flex items-center justify-between">
                  <span className="text-base">{hoveredCountry.flag}</span>
                  <span className="font-heading font-bold text-white text-xs truncate max-w-[90px]">
                    {hoveredCountry.name}
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                    {hoveredCountry.code}
                  </span>
                </div>

                <div className="text-[10px] text-slate-400">
                  Region: <span className="text-slate-300">{hoveredCountry.continent}</span>
                </div>

                <div className="pt-1.5 border-t border-white/[0.06] space-y-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Endpoints:</span>
                    <span className="font-bold text-white">
                      {hoveredStats?.total || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Online:</span>
                    <span className="font-bold text-emerald-400">
                      {hoveredStats?.online || 0}
                    </span>
                  </div>

                  {hoveredStats?.fastestLatency !== null && hoveredStats?.fastestLatency !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Fastest Ping:</span>
                      <span className="font-bold text-cyan-400">
                        {hoveredStats.fastestLatency} ms
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-1 text-[9px] text-amber-300/80 italic text-center">
                  {!hasAnalyzed
                    ? 'Run probe to test & unlock filter'
                    : hoveredStats?.total
                    ? 'Click to filter proxy table'
                    : 'No endpoints in scan'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Breakdown Panels: Top Concentrations & Continents */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-3 border-t border-white/[0.04]">
          {/* Top Concentrations */}
          <div className="md:col-span-2 space-y-2">
            <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Top Concentrations</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {topCountries.map((c) => {
                const isClickable = hasAnalyzed && c.total > 0
                return (
                  <button
                    key={c.code}
                    disabled={!isClickable}
                    onClick={() => isClickable && onSelectCountry(c.code)}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs font-mono transition-all text-left ${
                      !isClickable
                        ? 'opacity-60 cursor-not-allowed bg-[#080d16] border-white/[0.03] text-slate-400'
                        : activeCountryFilter === c.code
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)] cursor-pointer'
                        : 'bg-[#080d16] border-white/[0.05] hover:border-white/[0.12] text-slate-300 cursor-pointer'
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
                )
              })}
            </div>
          </div>

          {/* Continents Distribution */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-purple-400" />
              <span>Continents</span>
            </span>
            <div className="bg-[#080d16] p-2.5 rounded-xl border border-white/[0.05] space-y-2 text-xs font-mono">
              {Object.entries(continentStats)
                .filter(([_, count]) => count > 0)
                .sort((a, b) => b[1] - a[1])
                .map(([continent, count]) => {
                  const percentage = nodes.length > 0 ? Math.round((count / nodes.length) * 100) : 0
                  return (
                    <div key={continent} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">{continent}</span>
                        <span className="text-slate-200 font-bold">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-amber-400 rounded-full transition-all duration-300"
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
