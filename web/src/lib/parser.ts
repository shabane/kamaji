import { ProxyNode } from './types'
import { detectCountryFromText } from './countries'

export function parseSubscriptionText(text: string): ProxyNode[] {
  const nodes: ProxyNode[] = []
  if (!text) return nodes

  const lines = text.split(/\r?\n/)
  let idCounter = 1

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || line.startsWith('//')) continue

    try {
      if (line.startsWith('vless://')) {
        const node = parseVless(line, `node-${idCounter}`)
        if (node) {
          nodes.push(node)
          idCounter++
        }
      } else if (line.startsWith('vmess://')) {
        const node = parseVmess(line, `node-${idCounter}`)
        if (node) {
          nodes.push(node)
          idCounter++
        }
      } else if (line.startsWith('trojan://')) {
        const node = parseTrojan(line, `node-${idCounter}`)
        if (node) {
          nodes.push(node)
          idCounter++
        }
      }
    } catch {
      // Ignore unparseable lines
    }
  }

  return nodes
}

function parseVless(link: string, id: string): ProxyNode | null {
  try {
    const url = new URL(link)
    const type = url.searchParams.get('type') || url.searchParams.get('net') || 'tcp'
    if (type.toLowerCase() !== 'ws') return null // only WS transport

    const host = url.hostname
    const port = parseInt(url.port || '443', 10)
    const path = url.searchParams.get('path') || '/'
    const security = url.searchParams.get('security') || 'tls'
    const sni = url.searchParams.get('sni') || url.searchParams.get('host') || host
    const alpn = url.searchParams.get('alpn') || 'h2,http/1.1'
    
    let rawTitle = url.hash ? decodeURIComponent(url.hash.replace(/^#/, '')) : host
    // Clean up channel metadata if present
    const cleanTitle = cleanRemark(rawTitle)
    const { code, name, flag } = detectCountryFromText(rawTitle)

    return {
      id,
      rawLink: link,
      protocol: 'vless',
      transport: 'ws',
      title: cleanTitle,
      countryCode: code,
      countryName: name,
      flag,
      host,
      port,
      path: path.startsWith('/') ? path : `/${path}`,
      sni,
      security,
      alpn,
      status: 'pending',
      latency: null,
      failReason: null,
      lossPercent: 0,
      jitter: 0,
      sparkline: [],
    }
  } catch {
    return null
  }
}

function parseVmess(link: string, id: string): ProxyNode | null {
  try {
    const base64Str = link.replace('vmess://', '').trim()
    const jsonStr = decodeBase64Safe(base64Str)
    if (!jsonStr) return null

    const data = JSON.parse(jsonStr)
    const net = (data.net || 'tcp').toLowerCase()
    if (net !== 'ws') return null // only WS transport

    const host = data.add || ''
    const port = parseInt(data.port || 443, 10)
    const path = data.path || '/'
    const security = data.tls || 'none'
    const sni = data.sni || data.host || host
    const alpn = data.alpn || 'h2,http/1.1'
    const rawTitle = data.ps || host
    const cleanTitle = cleanRemark(rawTitle)
    const { code, name, flag } = detectCountryFromText(rawTitle)

    return {
      id,
      rawLink: link,
      protocol: 'vmess',
      transport: 'ws',
      title: cleanTitle,
      countryCode: code,
      countryName: name,
      flag,
      host,
      port,
      path: path.startsWith('/') ? path : `/${path}`,
      sni,
      security,
      alpn,
      status: 'pending',
      latency: null,
      failReason: null,
      lossPercent: 0,
      jitter: 0,
      sparkline: [],
    }
  } catch {
    return null
  }
}

function parseTrojan(link: string, id: string): ProxyNode | null {
  try {
    const url = new URL(link)
    const type = url.searchParams.get('type') || url.searchParams.get('net') || 'tcp'
    if (type.toLowerCase() !== 'ws') return null // only WS transport

    const host = url.hostname
    const port = parseInt(url.port || '443', 10)
    const path = url.searchParams.get('path') || '/'
    const security = url.searchParams.get('security') || 'tls'
    const sni = url.searchParams.get('sni') || url.searchParams.get('host') || host
    const alpn = url.searchParams.get('alpn') || 'h2,http/1.1'
    
    let rawTitle = url.hash ? decodeURIComponent(url.hash.replace(/^#/, '')) : host
    const cleanTitle = cleanRemark(rawTitle)
    const { code, name, flag } = detectCountryFromText(rawTitle)

    return {
      id,
      rawLink: link,
      protocol: 'trojan',
      transport: 'ws',
      title: cleanTitle,
      countryCode: code,
      countryName: name,
      flag,
      host,
      port,
      path: path.startsWith('/') ? path : `/${path}`,
      sni,
      security,
      alpn,
      status: 'pending',
      latency: null,
      failReason: null,
      lossPercent: 0,
      jitter: 0,
      sparkline: [],
    }
  } catch {
    return null
  }
}

function cleanRemark(remark: string): string {
  if (!remark) return 'Kamaji-Node'
  // Remove metadata tags like |channel:...|post_date:...
  let cleaned = remark.split('|channel:')[0]
  // If formatted like [1][DE][0][VLESS]... extract readable portion
  cleaned = cleaned.replace(/^\[\d+\]\[[^\]]*\]\[[^\]]*\]\[[^\]]*\]\[[^\]]*\]/, '')
  cleaned = cleaned.replace(/^[_\s-]+|[_\s-]+$/g, '')
  return cleaned || remark.slice(0, 30)
}

function decodeBase64Safe(input: string): string | null {
  try {
    let base64 = input.replace(/-/g, '+').replace(/_/g, '/')
    const pad = base64.length % 4
    if (pad) {
      base64 += '='.repeat(4 - pad)
    }
    return atob(base64)
  } catch {
    return null
  }
}
