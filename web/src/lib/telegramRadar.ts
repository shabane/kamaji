import { parseSubscriptionText } from './parser'
import { probeWebSocketNode } from './prober'
import { InterceptedNode } from './radarTypes'

const DEFAULT_CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
]

/**
 * Scrapes recent messages from a public Telegram channel and extracts proxy links.
 */
export async function scrapeTelegramChannel(
  channel: string,
  customCorsProxy?: string
): Promise<{ channel: string; links: string[]; error?: string }> {
  const cleanChannel = channel.trim().replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '')
  if (!cleanChannel) {
    return { channel: cleanChannel, links: [], error: 'Invalid channel name' }
  }

  const targetUrls = [
    `https://telegram.dog/s/${cleanChannel}`,
    `https://t.me/s/${cleanChannel}`,
  ]

  let htmlContent = ''
  let lastError: string | undefined

  // Build list of proxy fetchers to try in sequence
  const proxyFetchers: ((targetUrl: string) => string)[] = []

  if (customCorsProxy && customCorsProxy.trim()) {
    const base = customCorsProxy.trim()
    proxyFetchers.push((url) =>
      base.includes('?') ? `${base}${encodeURIComponent(url)}` : `${base}?url=${encodeURIComponent(url)}`
    )
  }

  proxyFetchers.push(...DEFAULT_CORS_PROXIES)

  // Try fetching page through proxies
  for (const proxyGen of proxyFetchers) {
    for (const targetUrl of targetUrls) {
      try {
        const proxyUrl = proxyGen(targetUrl)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 6000)

        const res = await fetch(proxyUrl, {
          signal: controller.signal,
          headers: {
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
        })
        clearTimeout(timeoutId)

        if (res.ok) {
          const text = await res.text()
          if (text && text.length > 200 && (text.includes('tgme_widget_message') || text.includes('vless://') || text.includes('vmess://') || text.includes('trojan://'))) {
            htmlContent = text
            break
          }
        }
      } catch (err: any) {
        lastError = err.message || 'Network error'
      }
    }
    if (htmlContent) break
  }

  if (!htmlContent) {
    return { channel: cleanChannel, links: [], error: lastError || 'Could not fetch channel messages' }
  }

  // Extract VLESS, VMess, and Trojan links via regular expressions
  const linkSet = new Set<string>()

  // Decode HTML entities if any (like &amp; into &)
  const decodedHtml = htmlContent
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')

  const vlessMatches = decodedHtml.match(/vless:\/\/[^\s<>"'`]+/gi) || []
  const vmessMatches = decodedHtml.match(/vmess:\/\/[^\s<>"'`]+/gi) || []
  const trojanMatches = decodedHtml.match(/trojan:\/\/[^\s<>"'`]+/gi) || []

  for (const l of [...vlessMatches, ...vmessMatches, ...trojanMatches]) {
    const trimmed = l.trim()
    if (trimmed.length > 20) {
      linkSet.add(trimmed)
    }
  }

  return { channel: cleanChannel, links: Array.from(linkSet) }
}

/**
 * Parses raw links, filters for WebSocket transport, and probes each node immediately.
 */
export async function testInterceptedLinks(
  rawLinks: string[],
  channelName: string,
  timeoutSec = 3.5
): Promise<InterceptedNode[]> {
  if (!rawLinks.length) return []

  const textPayload = rawLinks.join('\n')
  const parsedNodes = parseSubscriptionText(textPayload)

  // Filter only WebSocket nodes
  const wsNodes = parsedNodes.filter(
    (n) => n.transport === 'ws' || (n.rawLink && n.rawLink.toLowerCase().includes('type=ws'))
  )

  if (!wsNodes.length) return []

  // Probe nodes concurrently with WebSocket latency tester
  const results: InterceptedNode[] = []

  await Promise.all(
    wsNodes.map(async (node) => {
      try {
        const probeRes = await probeWebSocketNode(node, timeoutSec)
        if (probeRes.status === 'success' || probeRes.status === 'warning') {
          results.push({
            ...node,
            status: probeRes.status,
            latency: probeRes.latency,
            sourceChannel: channelName,
            interceptedAt: new Date().toLocaleTimeString(),
          })
        }
      } catch {
        // Drop failed nodes from radar stream
      }
    })
  )

  // Sort by lowest latency
  results.sort((a, b) => (a.latency ?? 9999) - (b.latency ?? 9999))
  return results
}
