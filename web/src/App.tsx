import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Navbar } from './components/Navbar'
import { ControlBar } from './components/ControlBar'
import { ProgressBar } from './components/ProgressBar'
import { MetricCards } from './components/MetricCards'
import { Toolbar } from './components/Toolbar'
import { NodeCard } from './components/NodeCard'
import { NodeTable } from './components/NodeTable'
import { QrModal } from './components/QrModal'
import { ImportModal } from './components/ImportModal'
import { LogsView } from './components/LogsView'
import { WorldMap } from './components/WorldMap'
import { BottomBanner } from './components/BottomBanner'
import { MobileBottomNav } from './components/MobileBottomNav'
import { parseSubscriptionText } from './lib/parser'
import { probeWebSocketNode } from './lib/prober'
import { ProxyNode, FilterStatus, SortOption, ViewMode, SourceTab } from './lib/types'

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'success' | 'warn' | 'error'
  message: string
}

export function App() {
  const [nodes, setNodes] = useState<ProxyNode[]>([])
  const [activeTab, setActiveTab] = useState<string>('scanner')
  const [currentSource, setCurrentSource] = useState<SourceTab>('auto')
  const [lastSyncTime, setLastSyncTime] = useState<string>('4m ago')

  // Scanner controls
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [concurrency, setConcurrency] = useState<number>(10)
  const [timeoutSec, setTimeoutSec] = useState<number>(3.5)
  const [protocolFilter, setProtocolFilter] = useState<string>('all')

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [sortOption, setSortOption] = useState<SortOption>('fastest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [activeCountryFilter, setActiveCountryFilter] = useState<string>('')

  // Telemetry & Modals
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [qrNode, setQrNode] = useState<ProxyNode | null>(null)
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false)
  const [isCopiedBatch, setIsCopiedBatch] = useState<boolean>(false)

  // Runner references
  const isRunningRef = useRef<boolean>(false)
  isRunningRef.current = isRunning
  const timerRef = useRef<any>(null)

  const addLog = (level: 'info' | 'success' | 'warn' | 'error', message: string) => {
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
    }
    setLogs((prev) => [entry, ...prev.slice(0, 199)])
  }

  // Load Auto-Feed on component mount
  useEffect(() => {
    loadAutoFeed()
  }, [])

  const loadAutoFeed = async () => {
    addLog('info', 'Loading verified feed (hub/self/tested/merged.txt)...')
    const localUrl = '../hub/self/tested/merged.txt'
    const fallbackUrl = 'https://raw.githubusercontent.com/shabane/kamaji/master/hub/self/tested/merged.txt'

    let text = ''
    try {
      const res = await fetch(localUrl)
      if (res.ok) {
        text = await res.text()
      } else {
        throw new Error('Local feed not accessible, trying fallback')
      }
    } catch {
      try {
        const res = await fetch(fallbackUrl)
        if (res.ok) {
          text = await res.text()
        }
      } catch (err) {
        addLog('error', 'Failed to fetch tested merged.txt feed from origins.')
      }
    }

    if (text) {
      const parsed = parseSubscriptionText(text)
      setNodes(parsed)
      setLastSyncTime('Just now')
      addLog('success', `Loaded ${parsed.length} WebSocket proxy nodes.`)
    }
  }

  // Timer effect for elapsed scan time
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 0.1)
      }, 100)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning])

  // Probing Runner
  useEffect(() => {
    if (!isRunning) return

    let activeSlots = 0
    let nodeIndex = 0

    // Clone list of pending nodes
    const pendingNodes = nodes.filter((n) => n.status === 'pending')
    if (pendingNodes.length === 0) {
      setIsRunning(false)
      addLog('success', 'All proxy endpoints scanned.')
      return
    }

    const runNext = async () => {
      if (!isRunningRef.current) return

      while (activeSlots < concurrency && nodeIndex < pendingNodes.length) {
        const targetNode = pendingNodes[nodeIndex]
        nodeIndex++
        activeSlots++

        // Mark node as probing
        setNodes((prev) =>
          prev.map((n) => (n.id === targetNode.id ? { ...n, status: 'probing' } : n))
        )

        // Execute probe in background slot
        probeWebSocketNode(targetNode, timeoutSec * 1000)
          .then((res) => {
            setNodes((prev) =>
              prev.map((n) =>
                n.id === targetNode.id
                  ? {
                      ...n,
                      status: res.status,
                      latency: res.latency,
                      failReason: res.failReason,
                      jitter: res.jitter,
                      sparkline: res.sparkline,
                    }
                  : n
              )
            )

            if (res.status === 'success') {
              addLog('success', `[OK] ${targetNode.title} > ${res.latency}ms`)
            } else if (res.status === 'warning') {
              addLog('warn', `[Jitter] ${targetNode.title} > ${res.latency}ms`)
            } else {
              addLog('error', `[FAIL] ${targetNode.title} > ${res.failReason}`)
            }
          })
          .catch(() => {
            setNodes((prev) =>
              prev.map((n) =>
                n.id === targetNode.id
                  ? { ...n, status: 'failed', failReason: 'Execution error' }
                  : n
              )
            )
          })
          .finally(() => {
            activeSlots--
            if (isRunningRef.current) {
              if (nodeIndex < pendingNodes.length) {
                runNext()
              } else if (activeSlots === 0) {
                setIsRunning(false)
                addLog('success', 'Batch scan completed!')
              }
            }
          })
      }
    }

    runNext()
  }, [isRunning])

  const handleToggleTest = () => {
    if (isRunning) {
      setIsRunning(false)
      addLog('warn', 'Scan paused by user.')
    } else {
      const allTested = nodes.every((n) => n.status !== 'pending')
      if (allTested) {
        setNodes((prev) =>
          prev.map((n) => ({
            ...n,
            status: 'pending',
            latency: null,
            failReason: null,
            sparkline: [],
          }))
        )
        setElapsedSeconds(0)
      }
      setIsRunning(true)
    }
  }

  const handleReload = () => {
    setIsRunning(false)
    setElapsedSeconds(0)
    loadAutoFeed()
  }

  const handleRetestSingle = async (node: ProxyNode) => {
    addLog('info', `Retesting node: ${node.title}...`)
    setNodes((prev) =>
      prev.map((n) => (n.id === node.id ? { ...n, status: 'probing' } : n))
    )

    const res = await probeWebSocketNode(node, timeoutSec * 1000)
    setNodes((prev) =>
      prev.map((n) =>
        n.id === node.id
          ? {
              ...n,
              status: res.status,
              latency: res.latency,
              failReason: res.failReason,
              jitter: res.jitter,
              sparkline: res.sparkline,
            }
          : n
      )
    )

    if (res.status === 'success') {
      addLog('success', `[Retest OK] ${node.title} > ${res.latency}ms`)
    } else {
      addLog('error', `[Retest Fail] ${node.title} > ${res.failReason}`)
    }
  }

  const handleImportUrl = async (url: string) => {
    addLog('info', `Importing subscription from: ${url}`)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`)
    const text = await res.text()
    const parsed = parseSubscriptionText(text)
    if (parsed.length === 0) throw new Error('No valid WebSocket proxies found in link.')
    setNodes(parsed)
    setCurrentSource('custom')
    addLog('success', `Successfully imported ${parsed.length} endpoints from custom URL.`)
  }

  const handleImportRaw = (text: string) => {
    const parsed = parseSubscriptionText(text)
    if (parsed.length === 0) {
      alert('No valid WebSocket nodes found. Make sure links are vless://, vmess://, or trojan:// with type=ws.')
      return
    }
    setNodes(parsed)
    setCurrentSource('raw')
    addLog('success', `Successfully loaded ${parsed.length} endpoints from raw text.`)
  }

  // Batch Export Actions
  const workingNodes = useMemo(
    () => nodes.filter((n) => n.status === 'success' || n.status === 'warning'),
    [nodes]
  )

  const handleCopyWorking = () => {
    if (workingNodes.length === 0) return
    const text = workingNodes.map((n) => n.rawLink).join('\n')
    navigator.clipboard.writeText(text)
    setIsCopiedBatch(true)
    setTimeout(() => setIsCopiedBatch(false), 2500)
    addLog('info', `Copied ${workingNodes.length} verified endpoints to clipboard.`)
  }

  const handleDownloadTxt = () => {
    if (workingNodes.length === 0) return
    const text = workingNodes.map((n) => n.rawLink).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kamaji_verified_ws_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    addLog('info', `Downloaded ${workingNodes.length} verified endpoints.`)
  }

  const handleCopyBase64 = () => {
    if (workingNodes.length === 0) return
    const text = workingNodes.map((n) => n.rawLink).join('\n')
    const b64 = btoa(unescape(encodeURIComponent(text)))
    navigator.clipboard.writeText(b64)
    setIsCopiedBatch(true)
    setTimeout(() => setIsCopiedBatch(false), 2500)
    addLog('info', `Copied Base64 subscription format to clipboard.`)
  }

  // Filtered and Sorted Nodes
  const filteredNodes = useMemo(() => {
    let list = [...nodes]

    // Protocol filter
    if (protocolFilter !== 'all') {
      list = list.filter((n) => n.protocol === protocolFilter)
    }

    // Status filter
    if (statusFilter === 'working') {
      list = list.filter((n) => n.status === 'success' || n.status === 'warning')
    } else if (statusFilter === 'failed') {
      list = list.filter((n) => n.status === 'failed')
    } else if (statusFilter === 'pending') {
      list = list.filter((n) => n.status === 'pending' || n.status === 'probing')
    }

    // Country filter (e.g. from World Map hexagon click)
    if (activeCountryFilter) {
      list = list.filter(
        (n) => n.countryCode?.toUpperCase() === activeCountryFilter.toUpperCase()
      )
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.countryName.toLowerCase().includes(q) ||
          n.countryCode.toLowerCase().includes(q) ||
          n.host.toLowerCase().includes(q) ||
          n.sni.toLowerCase().includes(q)
      )
    }

    // Sorting
    if (sortOption === 'fastest') {
      list.sort((a, b) => {
        if (a.latency === null) return 1
        if (b.latency === null) return -1
        return a.latency - b.latency
      })
    } else if (sortOption === 'country') {
      list.sort((a, b) => a.countryName.localeCompare(b.countryName))
    } else if (sortOption === 'protocol') {
      list.sort((a, b) => a.protocol.localeCompare(b.protocol))
    }

    return list
  }, [nodes, protocolFilter, statusFilter, searchQuery, sortOption])

  // Lazy Loading / Infinite Scroll (Render only visible portion to save DOM nodes)
  const [visibleCount, setVisibleCount] = useState<number>(36)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Reset pagination on search/filter changes
  useEffect(() => {
    setVisibleCount(36)
  }, [searchQuery, statusFilter, protocolFilter, sortOption, activeCountryFilter])

  // IntersectionObserver to load more as user scrolls down
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 36, filteredNodes.length))
        }
      },
      { rootMargin: '350px' }
    )

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current)
    }

    return () => observer.disconnect()
  }, [filteredNodes.length])

  const displayedNodes = useMemo(() => {
    return filteredNodes.slice(0, visibleCount)
  }, [filteredNodes, visibleCount])

  const testedCount = useMemo(() => {
    return nodes.filter((n) => n.status === 'success' || n.status === 'warning' || n.status === 'failed').length
  }, [nodes])

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col pb-16 md:pb-6">
      {/* Minimalist Top Navigation */}
      <Navbar onOpenImport={() => setIsImportOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* Streamlined Control & Source Bar */}
        <ControlBar
          isRunning={isRunning}
          onToggleTest={handleToggleTest}
          onReload={handleReload}
          currentSource={currentSource}
          onSelectSource={(source) => {
            setCurrentSource(source)
            if (source === 'auto') {
              loadAutoFeed()
            } else {
              setIsImportOpen(true)
            }
          }}
          totalCount={nodes.length}
          lastSyncTime={lastSyncTime}
          concurrency={concurrency}
          setConcurrency={setConcurrency}
          timeoutSec={timeoutSec}
          setTimeoutSec={setTimeoutSec}
        />

        {/* Minimal Progress Bar */}
        <ProgressBar
          isRunning={isRunning}
          testedCount={testedCount}
          totalCount={nodes.length}
          elapsedSeconds={elapsedSeconds}
        />

        {/* 4 Clean Metric Cards */}
        <MetricCards nodes={nodes} />

        {/* Minimal Filter & Search Toolbar (with [Scanner | Matrix | Logs] switcher next to search input) */}
        <Toolbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          nodes={nodes}
          onCopyWorking={handleCopyWorking}
          onDownloadTxt={handleDownloadTxt}
          onCopyBase64={handleCopyBase64}
          isCopied={isCopiedBatch}
        />

        {/* Content Tabs View */}
        {activeTab === 'logs' ? (
          <LogsView logs={logs} onClearLogs={() => setLogs([])} />
        ) : activeTab === 'map' ? (
          <div className="space-y-4">
            <WorldMap
              nodes={nodes}
              onSelectCountry={(countryCode) => {
                setActiveCountryFilter((prev) => (prev === countryCode ? '' : countryCode))
              }}
              activeCountryFilter={activeCountryFilter}
            />

            {activeCountryFilter && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono text-slate-400">
                    Filtered by country {activeCountryFilter} ({filteredNodes.length} nodes)
                  </h3>
                  <button
                    onClick={() => setActiveTab('scanner')}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>View in Scanner Grid</span>
                    <span>&rarr;</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {displayedNodes.map((node) => (
                    <NodeCard
                      key={node.id}
                      node={node}
                      onRetest={handleRetestSingle}
                      onOpenQr={(n) => setQrNode(n)}
                    />
                  ))}
                </div>
                {visibleCount < filteredNodes.length && (
                  <div
                    ref={sentinelRef}
                    className="py-6 text-center text-xs font-mono text-slate-500 flex items-center justify-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span>Loaded {displayedNodes.length} of {filteredNodes.length} endpoints • Scroll for more</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Nodes Grid / Table */}
            {filteredNodes.length === 0 ? (
              <div className="bg-[#0a0f19] p-12 rounded-2xl border border-white/[0.05] text-center space-y-2">
                <p className="text-slate-400 font-mono text-sm">
                  No matching endpoints found.
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  Try adjusting your search query, status filters, or reload the feed.
                </p>
              </div>
            ) : activeTab === 'matrix' || viewMode === 'table' ? (
              <>
                <NodeTable
                  nodes={displayedNodes}
                  onRetest={handleRetestSingle}
                  onOpenQr={(n) => setQrNode(n)}
                />

                {/* Lazy Load Sentinel */}
                {visibleCount < filteredNodes.length && (
                  <div
                    ref={sentinelRef}
                    className="py-6 text-center text-xs font-mono text-slate-500 flex items-center justify-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span>Loaded {displayedNodes.length} of {filteredNodes.length} endpoints • Scroll for more</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {displayedNodes.map((node) => (
                    <NodeCard
                      key={node.id}
                      node={node}
                      onRetest={handleRetestSingle}
                      onOpenQr={(n) => setQrNode(n)}
                    />
                  ))}
                </div>

                {/* Lazy Load Sentinel */}
                {visibleCount < filteredNodes.length && (
                  <div
                    ref={sentinelRef}
                    className="py-6 text-center text-xs font-mono text-slate-500 flex items-center justify-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span>Loaded {displayedNodes.length} of {filteredNodes.length} endpoints • Scroll for more</span>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Single-line Minimal Footer */}
        <BottomBanner />
      </main>

      {/* QR Code Modal */}
      <QrModal node={qrNode} onClose={() => setQrNode(null)} />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportUrl={handleImportUrl}
        onImportRaw={handleImportRaw}
      />

      {/* Mobile Sticky Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'logs') {
            setActiveTab('logs')
          } else if (tab === 'map') {
            setActiveTab('map')
          } else if (tab === 'matrix') {
            setViewMode('table')
            setActiveTab('matrix')
          } else {
            setViewMode('grid')
            setActiveTab('scanner')
          }
        }}
      />
    </div>
  )
}

export default App
