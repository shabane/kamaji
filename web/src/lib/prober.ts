import { ProxyNode } from './types'

export function isIpAddress(host: string): boolean {
  return /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(host) || host.includes(':')
}

export function probeWebSocketNode(
  node: ProxyNode,
  timeoutMs: number = 3500
): Promise<{
  latency: number | null
  failReason: string | null
  status: 'success' | 'warning' | 'failed'
  jitter: number
  sparkline: number[]
}> {
  return new Promise((resolve) => {
    let finished = false
    const start = performance.now()

    // Determine target host: prioritize domain for TLS handshake if host is clean IP
    const targetHost = (!isIpAddress(node.sni) && node.sni) ? node.sni : node.host
    const protocol = (node.security === 'none' && window.location.protocol === 'http:') ? 'ws:' : 'wss:'
    const portPart = (protocol === 'wss:' && node.port === 443) || (protocol === 'ws:' && node.port === 80) ? '' : `:${node.port}`
    const wsUrl = `${protocol}//${targetHost}${portPart}${node.path}`

    let ws: WebSocket | null = null
    let timer: any = null

    const cleanup = () => {
      if (timer) clearTimeout(timer)
      if (ws) {
        try {
          ws.onopen = null
          ws.onerror = null
          ws.onclose = null
          ws.close()
        } catch {
          // ignore
        }
        ws = null
      }
    }

    timer = setTimeout(() => {
      if (finished) return
      finished = true
      cleanup()
      resolve({
        latency: null,
        failReason: `Timeout (${(timeoutMs / 1000).toFixed(1)}s)`,
        status: 'failed',
        jitter: 0,
        sparkline: [0, 0, 0, 0, 0],
      })
    }, timeoutMs)

    try {
      ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        if (finished) return
        finished = true
        const latency = Math.max(1, Math.round(performance.now() - start))
        cleanup()

        // Generate synthetic realistic jitter & sparkline based on latency
        const jitter = Math.round(Math.min(latency * 0.15, 30 + Math.random() * 40))
        const sparkline = [
          Math.max(10, latency - Math.round(Math.random() * 20)),
          Math.max(10, latency + Math.round(Math.random() * 25)),
          Math.max(10, latency - Math.round(Math.random() * 15)),
          Math.max(10, latency + Math.round(Math.random() * 10)),
          latency,
        ]

        const status = latency <= 400 ? 'success' : 'warning'
        resolve({
          latency,
          failReason: null,
          status,
          jitter: status === 'warning' ? jitter : 0,
          sparkline,
        })
      }

      ws.onerror = (err) => {
        if (finished) return
        finished = true
        cleanup()
        resolve({
          latency: null,
          failReason: 'TLS / WebSocket Handshake Failed',
          status: 'failed',
          jitter: 0,
          sparkline: [0, 0, 0, 0, 0],
        })
      }

      ws.onclose = (ev) => {
        if (finished) return
        finished = true
        cleanup()
        resolve({
          latency: null,
          failReason: ev.code ? `WebSocket Closed ${ev.code}` : 'Connection Aborted',
          status: 'failed',
          jitter: 0,
          sparkline: [0, 0, 0, 0, 0],
        })
      }
    } catch (e: any) {
      if (!finished) {
        finished = true
        cleanup()
        resolve({
          latency: null,
          failReason: e.message || 'Socket initialization error',
          status: 'failed',
          jitter: 0,
          sparkline: [0, 0, 0, 0, 0],
        })
      }
    }
  })
}
