import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  Radio,
  Play,
  Pause,
  Sliders,
  Settings,
  Plus,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Shield,
  Search,
  X,
  Globe,
  Compass,
} from 'lucide-react'
import { DEFAULT_CHANNELS } from '../lib/defaultChannels'
import { RadarChannel, RadarCadence, RadarBlip, InterceptedNode } from '../lib/radarTypes'
import { scrapeTelegramChannel, testInterceptedLinks } from '../lib/telegramRadar'
import { getCountryFlag } from '../lib/countries'

interface RadarViewProps {
  onOpenQr: (node: any) => void
}

const STORAGE_CHANNELS_KEY = 'kamaji_radar_channels'
const STORAGE_CADENCE_KEY = 'kamaji_radar_cadence'
const STORAGE_CORS_KEY = 'kamaji_radar_cors_proxy'

export const RadarView: React.FC<RadarViewProps> = ({ onOpenQr }) => {
  // Channels state
  const [channels, setChannels] = useState<RadarChannel[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CHANNELS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}

    // Initial seed: enable top 25 channels by default
    return DEFAULT_CHANNELS.map((username, index) => ({
      username,
      enabled: index < 25,
      foundCount: 0,
      lastStatus: 'idle',
    }))
  })

  // Cadence state (batch size & interval)
  const [cadence, setCadence] = useState<RadarCadence>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CADENCE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    return { batchSize: 2, intervalSec: 3 }
  })

  const [customCorsProxy, setCustomCorsProxy] = useState<string>(() => {
    return localStorage.getItem(STORAGE_CORS_KEY) || ''
  })

  // Radar Execution state
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false)
  const [interceptedNodes, setInterceptedNodes] = useState<InterceptedNode[]>([])
  const [blips, setBlips] = useState<RadarBlip[]>([])
  const [currentCheckingChannels, setCurrentCheckingChannels] = useState<string[]>([])
  const [scannedChannelsCount, setScannedChannelsCount] = useState<number>(0)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isCopiedBatch, setIsCopiedBatch] = useState<boolean>(false)

  // Modals & Panels
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false)
  const [channelSearch, setChannelSearch] = useState<string>('')
  const [newChannelInput, setNewChannelInput] = useState<string>('')

  // References for round-robin loop
  const channelIndexRef = useRef<number>(0)
  const timerRef = useRef<any>(null)
  const isRunningRef = useRef<boolean>(isRunning)
  isRunningRef.current = isRunning
  const channelsRef = useRef<RadarChannel[]>(channels)
  channelsRef.current = channels
  const cadenceRef = useRef<RadarCadence>(cadence)
  cadenceRef.current = cadence

  // Save channels to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CHANNELS_KEY, JSON.stringify(channels))
    } catch {}
  }, [channels])

  // Save cadence to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CADENCE_KEY, JSON.stringify(cadence))
    } catch {}
  }, [cadence])

  // Save custom CORS proxy to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CORS_KEY, customCorsProxy)
    } catch {}
  }, [customCorsProxy])

  // Clean up blips after 8 seconds
  useEffect(() => {
    const blipCleaner = setInterval(() => {
      const now = Date.now()
      setBlips((prev) => prev.filter((b) => now - b.createdAt < 9000))
    }, 2000)
    return () => clearInterval(blipCleaner)
  }, [])

  // Audio radar ping sound
  const playSonarSound = () => {
    if (!soundEnabled) return
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08)
      gain.gain.setValueAtTime(0.06, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.12)
    } catch {}
  }

  // Master Round-Robin Loop
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearTimeout(timerRef.current)
      setCurrentCheckingChannels([])
      return
    }

    const executeBatch = async () => {
      if (!isRunningRef.current) return

      const activeChannels = channelsRef.current.filter((c) => c.enabled)
      if (activeChannels.length === 0) {
        setIsRunning(false)
        return
      }

      // Pick next batch of channels using round-robin
      const batchSize = Math.min(
        Math.max(1, cadenceRef.current.batchSize),
        activeChannels.length
      )
      const selectedBatch: RadarChannel[] = []
      for (let i = 0; i < batchSize; i++) {
        const idx = channelIndexRef.current % activeChannels.length
        selectedBatch.push(activeChannels[idx])
        channelIndexRef.current++
      }

      const channelNames = selectedBatch.map((c) => c.username)
      setCurrentCheckingChannels(channelNames)
      setScannedChannelsCount((prev) => prev + selectedBatch.length)

      // Add temporary blips on radar screen
      const newBlips: RadarBlip[] = selectedBatch.map((c, i) => {
        const angle = (channelIndexRef.current * 47 + i * 80) % 360
        const dist = 0.35 + ((channelIndexRef.current * 19 + i * 25) % 45) / 100
        return {
          id: `${c.username}-${Date.now()}-${i}`,
          channel: c.username,
          angleDeg: angle,
          distanceRatio: dist,
          createdAt: Date.now(),
          status: 'checking',
        }
      })
      setBlips((prev) => [...prev.slice(-15), ...newBlips])

      // Process batch
      await Promise.all(
        selectedBatch.map(async (c) => {
          try {
            const scrapeRes = await scrapeTelegramChannel(c.username, customCorsProxy)
            if (scrapeRes.links.length > 0) {
              const testedWorking = await testInterceptedLinks(scrapeRes.links, c.username, 3.2)
              if (testedWorking.length > 0) {
                playSonarSound()
                setInterceptedNodes((prev) => {
                  const existingLinks = new Set(prev.map((n) => n.rawLink))
                  const novel = testedWorking.filter((n) => !existingLinks.has(n.rawLink))
                  return [...novel, ...prev].slice(0, 150)
                })

                // Mark blip as online
                setBlips((prev) =>
                  prev.map((b) =>
                    b.channel === c.username
                      ? { ...b, status: 'online', configTitle: testedWorking[0].title }
                      : b
                  )
                )

                // Update channel found counter
                setChannels((prev) =>
                  prev.map((item) =>
                    item.username === c.username
                      ? {
                          ...item,
                          foundCount: item.foundCount + testedWorking.length,
                          lastStatus: 'found',
                          lastCheckedAt: new Date().toLocaleTimeString(),
                        }
                      : item
                  )
                )
              } else {
                setChannels((prev) =>
                  prev.map((item) =>
                    item.username === c.username
                      ? { ...item, lastStatus: 'empty', lastCheckedAt: new Date().toLocaleTimeString() }
                      : item
                  )
                )
              }
            } else {
              setChannels((prev) =>
                prev.map((item) =>
                  item.username === c.username
                    ? { ...item, lastStatus: 'empty', lastCheckedAt: new Date().toLocaleTimeString() }
                    : item
                )
              )
            }
          } catch {
            setChannels((prev) =>
              prev.map((item) =>
                item.username === c.username
                  ? { ...item, lastStatus: 'error', lastCheckedAt: new Date().toLocaleTimeString() }
                  : item
              )
            )
          }
        })
      )

      // Schedule next tick
      if (isRunningRef.current) {
        timerRef.current = setTimeout(executeBatch, cadenceRef.current.intervalSec * 1000)
      }
    }

    executeBatch()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isRunning])

  // Add new channel
  const handleAddChannel = () => {
    const cleaned = newChannelInput.trim().replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '')
    if (!cleaned) return

    if (channels.some((c) => c.username.toLowerCase() === cleaned.toLowerCase())) {
      setNewChannelInput('')
      return
    }

    const newChan: RadarChannel = {
      username: cleaned,
      enabled: true,
      addedByUser: true,
      foundCount: 0,
      lastStatus: 'idle',
    }
    setChannels((prev) => [newChan, ...prev])
    setNewChannelInput('')
  }

  // Toggle channel
  const handleToggleChannel = (username: string) => {
    setChannels((prev) =>
      prev.map((c) => (c.username === username ? { ...c, enabled: !c.enabled } : c))
    )
  }

  // Delete channel
  const handleDeleteChannel = (username: string) => {
    setChannels((prev) => prev.filter((c) => c.username !== username))
  }

  // Reset channels to default
  const handleResetDefaults = () => {
    setChannels(
      DEFAULT_CHANNELS.map((username, index) => ({
        username,
        enabled: index < 25,
        foundCount: 0,
        lastStatus: 'idle',
      }))
    )
  }

  // Copy single link
  const handleCopyLink = (node: InterceptedNode) => {
    navigator.clipboard.writeText(node.link)
    setCopiedId(node.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Copy all intercepted links
  const handleCopyAll = () => {
    if (!interceptedNodes.length) return
    const text = interceptedNodes.map((n) => n.link).join('\n')
    navigator.clipboard.writeText(text)
    setIsCopiedBatch(true)
    setTimeout(() => setIsCopiedBatch(false), 2000)
  }

  // Filter channels list for manager
  const filteredChannels = useMemo(() => {
    if (!channelSearch.trim()) return channels
    const q = channelSearch.toLowerCase().trim()
    return channels.filter((c) => c.username.toLowerCase().includes(q))
  }, [channels, channelSearch])

  const activeChannelsCount = useMemo(() => channels.filter((c) => c.enabled).length, [channels])

  return (
    <div className="space-y-4">
      {/* Top Banner & Stats Overview */}
      <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20 bg-[#040e0b]/90 shadow-2xl relative overflow-hidden">
        {/* Neon scanline accent */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-3 border-b border-emerald-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-base text-white tracking-wide">
                  Live Telegram Proxy Radar
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                  <span>{isRunning ? 'SCANNING ACTIVE' : 'RADAR STANDBY'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Real-time WebSocket hunter • Round-robin channel monitor • In-browser verified latency
              </p>
            </div>
          </div>

          {/* Controls: Start/Pause, Sound, Settings */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              onClick={() => setIsRunning((r) => !r)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-heading font-bold text-xs transition-all cursor-pointer shadow-lg ${
                isRunning
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isRunning ? 'Pause Radar' : 'Activate Radar'}</span>
            </button>

            <button
              onClick={() => setSoundEnabled((s) => !s)}
              className={`p-2 rounded-xl border text-xs font-mono transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-[#08120e] border-white/[0.08] text-slate-400 hover:text-white'
              }`}
              title={soundEnabled ? 'Mute radar ping audio' : 'Enable radar ping audio'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsSettingsOpen((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#08120e] border border-white/[0.08] text-xs font-mono text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Channels ({activeChannelsCount})</span>
            </button>
          </div>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          <div className="bg-[#020b08] p-2.5 rounded-xl border border-emerald-500/15">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Active Pool</span>
            <span className="text-base font-bold font-mono text-emerald-400">
              {activeChannelsCount} <span className="text-xs font-normal text-slate-500">/ {channels.length}</span>
            </span>
          </div>

          <div className="bg-[#020b08] p-2.5 rounded-xl border border-emerald-500/15">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Cadence</span>
            <span className="text-base font-bold font-mono text-emerald-400">
              {cadence.batchSize} <span className="text-xs font-normal text-slate-500">ch / {cadence.intervalSec === 0 ? '0s (no delay)' : `${cadence.intervalSec}s`}</span>
            </span>
          </div>

          <div className="bg-[#020b08] p-2.5 rounded-xl border border-emerald-500/15">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Checks Executed</span>
            <span className="text-base font-bold font-mono text-white">{scannedChannelsCount}</span>
          </div>

          <div className="bg-[#020b08] p-2.5 rounded-xl border border-emerald-500/15">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Online Intercepted</span>
            <span className="text-base font-bold font-mono text-emerald-400 shadow-sm">
              {interceptedNodes.length}
            </span>
          </div>
        </div>

        {/* Current Scanning Pills */}
        {isRunning && currentCheckingChannels.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs font-mono text-slate-400 overflow-x-auto">
            <span className="text-[11px] text-emerald-400 font-semibold shrink-0 flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>Scanning:</span>
            </span>
            {currentCheckingChannels.map((c) => (
              <span
                key={c}
                className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] animate-pulse"
              >
                @{c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Radar Screen Visual */}
      <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20 bg-[#020906] shadow-2xl relative overflow-hidden flex flex-col items-center">
        {/* Radar Circular Bezel */}
        <div
          className="relative w-full max-w-[500px] aspect-square rounded-full border-2 border-emerald-500/40 bg-radial from-[#041d16] via-[#020e0a] to-[#010604] shadow-[0_0_50px_rgba(16,185,129,0.15)] flex items-center justify-center select-none"
          style={{ '--radar-interval': `${Math.min(Math.max(cadence.intervalSec, 1.5), 8)}s` } as any}
        >
          {/* Degree Ticks Around Circumference */}
          <div className="absolute inset-2 rounded-full border border-emerald-500/20 pointer-events-none" />
          <div className="absolute top-2 text-[10px] font-mono text-emerald-500/60 font-bold">0° N</div>
          <div className="absolute right-2 text-[10px] font-mono text-emerald-500/60 font-bold">90° E</div>
          <div className="absolute bottom-2 text-[10px] font-mono text-emerald-500/60 font-bold">180° S</div>
          <div className="absolute left-2 text-[10px] font-mono text-emerald-500/60 font-bold">270° W</div>

          {/* SVG Range Rings & Crosshairs */}
          <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Range Rings */}
            <circle cx="200" cy="200" r="45" fill="none" stroke="rgba(16,185,129,0.2)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="200" cy="200" r="95" fill="none" stroke="rgba(16,185,129,0.25)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="200" cy="200" r="145" fill="none" stroke="rgba(16,185,129,0.3)" strokeWidth="1.2" />
            <circle cx="200" cy="200" r="190" fill="none" stroke="rgba(16,185,129,0.35)" strokeWidth="1.5" />

            {/* Crosshairs */}
            <line x1="200" y1="10" x2="200" y2="390" stroke="rgba(16,185,129,0.25)" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="10" y1="200" x2="390" y2="200" stroke="rgba(16,185,129,0.25)" strokeWidth="1" strokeDasharray="4 4" />

            {/* Distance Text */}
            <text x="204" y="160" fill="rgba(16,185,129,0.4)" fontSize="8" fontFamily="monospace">25 KM</text>
            <text x="204" y="110" fill="rgba(16,185,129,0.4)" fontSize="8" fontFamily="monospace">50 KM</text>
            <text x="204" y="60" fill="rgba(16,185,129,0.4)" fontSize="8" fontFamily="monospace">75 KM</text>
          </svg>

          {/* Rotating Sweep Beam */}
          {isRunning && (
            <div
              className="absolute inset-0 rounded-full animate-radar-sweep pointer-events-none"
              style={{
                background:
                  'conic-gradient(from 0deg at 50% 50%, rgba(16, 185, 129, 0.45) 0deg, rgba(16, 185, 129, 0.15) 30deg, transparent 65deg, transparent 360deg)',
              }}
            />
          )}

          {/* Center Origin Node */}
          <div className="relative z-10 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-[0_0_12px_#10b981] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
          </div>

          {/* Dynamic Radar Blips */}
          {blips.map((blip) => {
            const rad = (blip.angleDeg * Math.PI) / 180
            const maxR = 175 // radius bound
            const r = blip.distanceRatio * maxR
            const x = 200 + r * Math.cos(rad)
            const y = 200 + r * Math.sin(rad)
            const isOnline = blip.status === 'online'

            return (
              <div
                key={blip.id}
                className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto group cursor-pointer"
                style={{ left: `${(x / 400) * 100}%`, top: `${(y / 400) * 100}%` }}
              >
                {/* Ping wave */}
                <div
                  className={`absolute -inset-2 rounded-full animate-ping opacity-75 ${
                    isOnline ? 'bg-emerald-400' : 'bg-cyan-400'
                  }`}
                />

                {/* Blip Core */}
                <div
                  className={`w-3 h-3 rounded-full border border-white shadow-lg transition-transform group-hover:scale-150 ${
                    isOnline
                      ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]'
                      : 'bg-cyan-400 shadow-[0_0_8px_#00f2fe]'
                  }`}
                />

                {/* Blip Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-30">
                  <div className="bg-[#03150f] border border-emerald-500/40 rounded-lg p-1.5 shadow-2xl text-[10px] font-mono text-emerald-300 whitespace-nowrap">
                    <strong>@{blip.channel}</strong>
                    {isOnline && <span className="block text-white text-[9px]">Proxy Intercepted!</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Radar Footnote */}
        <div className="mt-3 text-center text-xs font-mono text-slate-400 flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Scanning Channel</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            <span className="text-emerald-300 font-bold">Online WS Intercepted</span>
          </span>
        </div>
      </div>

      {/* Live Intercepted Feeds Table / Cards */}
      <div className="glass-panel p-4 rounded-2xl border border-white/[0.08] bg-[#070e17]/95 shadow-2xl space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="font-heading font-bold text-sm text-white">
              Live Intercepted WebSocket Proxies
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
              {interceptedNodes.length} Ready
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              disabled={interceptedNodes.length === 0}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                interceptedNodes.length > 0
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 cursor-pointer'
                  : 'bg-white/[0.03] border-white/[0.05] text-slate-500 cursor-not-allowed'
              }`}
            >
              {isCopiedBatch ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopiedBatch ? 'Copied All!' : 'Copy All Working'}</span>
            </button>

            <button
              onClick={() => setInterceptedNodes([])}
              disabled={interceptedNodes.length === 0}
              className="p-1.5 rounded-xl border border-white/[0.08] hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Clear intercepted nodes list"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Empty state */}
        {interceptedNodes.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Radio className="w-8 h-8 text-emerald-500/30 mx-auto animate-pulse" />
            <p className="text-xs font-mono">Radar is listening for fresh Telegram WebSocket configs...</p>
            <p className="text-[11px] text-slate-500">
              Click &quot;Activate Radar&quot; above to begin round-robin scraping & probing.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {interceptedNodes.map((node) => (
              <div
                key={node.id}
                className="glass-panel p-3 rounded-xl border border-emerald-500/25 bg-[#05110d] hover:border-emerald-400 transition-all space-y-2 relative"
              >
                <div className="flex items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-base">{getCountryFlag(node.countryCode)}</span>
                    <span className="font-heading font-bold text-white text-xs truncate max-w-[140px]">
                      {node.title || node.host}
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase font-bold">
                    {node.protocol} WS
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-white/[0.04]">
                  <span>Ping:</span>
                  <span className="font-bold text-emerald-400">{node.latency} ms</span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Source:</span>
                  <span className="text-cyan-300">@{node.sourceChannel}</span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Time:</span>
                  <span>{node.interceptedAt}</span>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-white/[0.04]">
                  <button
                    onClick={() => onOpenQr(node)}
                    className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Show QR Code"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleCopyLink(node)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-mono transition-colors cursor-pointer"
                  >
                    {copiedId === node.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === node.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Channel Management & Cadence Settings Modal / Drawer */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="glass-panel w-full max-w-xl max-h-[85vh] rounded-2xl border border-white/[0.1] bg-[#09121c] p-4 flex flex-col space-y-4 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span className="font-heading font-bold text-sm text-white">
                  Radar Cadence & Channel Management
                </span>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cadence Settings Section */}
            <div className="p-3 rounded-xl bg-[#060c14] border border-white/[0.05] space-y-3 text-xs font-mono">
              <span className="font-bold text-white text-[11px] uppercase tracking-wider block text-emerald-400">
                1. Rate Limiting & Scan Cadence
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Batch Size */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Batch Size (1 - 100):</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={cadence.batchSize}
                        onChange={(e) => {
                          const val = Math.min(100, Math.max(1, Number(e.target.value) || 1))
                          setCadence((c) => ({ ...c, batchSize: val }))
                        }}
                        className="w-14 px-1.5 py-0.5 text-center bg-[#03070d] border border-white/10 rounded text-emerald-400 font-bold text-xs focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-[11px] text-slate-500 font-normal">ch</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={cadence.batchSize}
                    onChange={(e) => setCadence((c) => ({ ...c, batchSize: Number(e.target.value) }))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block">Channels scraped per cycle (1 to 100)</span>
                </div>

                {/* Interval */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Scan Interval (0 - 100s):</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={cadence.intervalSec}
                        onChange={(e) => {
                          const parsed = Number(e.target.value)
                          const val = isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed))
                          setCadence((c) => ({ ...c, intervalSec: val }))
                        }}
                        className="w-14 px-1.5 py-0.5 text-center bg-[#03070d] border border-white/10 rounded text-emerald-400 font-bold text-xs focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-[11px] text-slate-500 font-normal">sec</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={cadence.intervalSec}
                    onChange={(e) => setCadence((c) => ({ ...c, intervalSec: Number(e.target.value) }))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    {cadence.intervalSec === 0 ? '⚡ 0s: Continuous instant cycle (no delay)' : 'Delay between cycles (0 to 100 seconds)'}
                  </span>
                </div>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.04]">
                <span className="text-[10px] text-slate-500">Presets:</span>
                <button
                  onClick={() => setCadence({ batchSize: 1, intervalSec: 5 })}
                  className="px-2 py-0.5 rounded bg-white/[0.05] hover:bg-white/[0.1] text-[10px] text-slate-300"
                >
                  Stealth (1ch/5s)
                </button>
                <button
                  onClick={() => setCadence({ batchSize: 5, intervalSec: 3 })}
                  className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-emerald-300"
                >
                  Balanced (5ch/3s)
                </button>
                <button
                  onClick={() => setCadence({ batchSize: 20, intervalSec: 1 })}
                  className="px-2 py-0.5 rounded bg-white/[0.05] hover:bg-white/[0.1] text-[10px] text-slate-300"
                >
                  Turbo (20ch/1s)
                </button>
                <button
                  onClick={() => setCadence({ batchSize: 50, intervalSec: 0 })}
                  className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-[10px] text-amber-300 hover:bg-amber-500/25"
                >
                  ⚡ Instant (50ch/0s)
                </button>
                <button
                  onClick={() => setCadence({ batchSize: 100, intervalSec: 0 })}
                  className="px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-[10px] text-rose-300 hover:bg-rose-500/25 font-bold"
                >
                  🔥 Uncapped (100ch/0s)
                </button>
              </div>

              {/* Custom CORS Proxy */}
              <div className="pt-2 border-t border-white/[0.04] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 block font-medium">Custom CORS Proxy URL (Optional):</span>
                  <span className="text-[9px] text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    Default: Open Readers (No Key Needed)
                  </span>
                </div>
                <input
                  type="text"
                  value={customCorsProxy}
                  onChange={(e) => setCustomCorsProxy(e.target.value)}
                  placeholder="Default uses Jina Reader & CodeTabs • Or enter your Cloudflare Worker"
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#03070d] border border-white/[0.08] rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500/50 placeholder:text-slate-600"
                />
                <p className="text-[10px] text-slate-500">
                  Requests run through open CORS readers (Jina Reader & CodeTabs) with zero API key requirements.
                </p>
              </div>
            </div>

            {/* Channels Directory Section */}
            <div className="space-y-3 flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-[11px] uppercase tracking-wider text-emerald-400">
                  2. Telegram Channels Pool ({activeChannelsCount} of {channels.length} Active)
                </span>
                <button
                  onClick={handleResetDefaults}
                  className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset to Default 201</span>
                </button>
              </div>

              {/* Add Custom Channel Bar */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newChannelInput}
                  onChange={(e) => setNewChannelInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddChannel()}
                  placeholder="Add channel (@username or link)..."
                  className="flex-1 px-3 py-1.5 text-xs font-mono bg-[#060c14] border border-white/[0.08] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
                <button
                  onClick={handleAddChannel}
                  disabled={!newChannelInput.trim()}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Search Filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={channelSearch}
                  onChange={(e) => setChannelSearch(e.target.value)}
                  placeholder="Filter channels..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-[#060c14] border border-white/[0.05] rounded-xl text-slate-300"
                />
              </div>

              {/* Scrollable Channels List */}
              <div className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-56">
                {filteredChannels.map((c) => (
                  <div
                    key={c.username}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#060c14] border border-white/[0.04] text-xs font-mono"
                  >
                    <label className="flex items-center gap-2 cursor-pointer truncate flex-1">
                      <input
                        type="checkbox"
                        checked={c.enabled}
                        onChange={() => handleToggleChannel(c.username)}
                        className="rounded accent-emerald-500 cursor-pointer"
                      />
                      <span className={`truncate ${c.enabled ? 'text-white font-medium' : 'text-slate-500'}`}>
                        @{c.username}
                      </span>
                    </label>

                    <div className="flex items-center gap-2 shrink-0">
                      {c.foundCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">
                          +{c.foundCount}
                        </span>
                      )}
                      <a
                        href={`https://t.me/${c.username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-500 hover:text-cyan-400 p-1"
                        title="Open Telegram Channel"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => handleDeleteChannel(c.username)}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                        title="Remove from pool"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-white/[0.06] flex justify-end">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 cursor-pointer"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
