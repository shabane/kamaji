import { parseSubscriptionText } from './parser'
import { probeWebSocketNode } from './prober'
import { InterceptedNode } from './radarTypes'

/**
 * Scrapes recent messages from a public Telegram channel and extracts proxy links.
 * Uses open, free CORS readers (Jina Reader, CodeTabs, AllOrigins) without requiring any API key.
 */
export async function scrapeTelegramChannel(
  channel: string,
  customCorsProxy?: string
): Promise<{ channel: string; links: string[]; error?: string }> {
  const cleanChannel = channel.trim().replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '')
  if (!cleanChannel) {
    return { channel: cleanChannel, links: [], error: 'Invalid channel name' }
  }

  // Build candidate proxy fetch URLs in priority order
  const fetchUrls: string[] = []

  if (customCorsProxy && customCorsProxy.trim()) {
    const base = customCorsProxy.trim()
    const target = `https://t.me/s/${cleanChannel}`
    fetchUrls.push(
      base.includes('?') ? `${base}${encodeURIComponent(target)}` : `${base}?url=${encodeURIComponent(target)}`
    )
  }

  // Primary open, reliable, free CORS readers (NO API KEY required)
  fetchUrls.push(
    `https://r.jina.ai/https://t.me/s/${cleanChannel}`,
    `https://r.jina.ai/https://telegram.dog/s/${cleanChannel}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://t.me/s/${cleanChannel}`)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(`https://t.me/s/${cleanChannel}`)}`
  )

  let content = ''
  let lastError: string | undefined

  // Try fetching page through proxies
  for (const proxyUrl of fetchUrls) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6500)

      const res = await fetch(proxyUrl, {
        signal: controller.signal,
        headers: {
          Accept: 'text/html,application/xhtml+xml,text/plain,text/markdown,*/*',
        },
      })
      clearTimeout(timeoutId)

      if (res.ok) {
        const text = await res.text()
        // Filter out API key requirement responses (e.g. if an outdated proxy requires a key)
        if (text.includes('API key is required') || text.includes('Invalid API key') || text.includes('rate limited')) {
          continue
        }

        if (
          text &&
          text.length > 100 &&
          (text.includes('vless://') ||
           text.includes('vmess://') ||
           text.includes('trojan://') ||
           text.includes('tgme_widget_message') ||
           text.includes('Markdown Content:') ||
           text.includes('subscribers') ||
           text.includes('members'))
        ) {
          content = text
          break
        }
      }
    } catch (err: any) {
      lastError = err.message || 'Network error'
    }
  }

  if (!content) {
    return { channel: cleanChannel, links: [], error: lastError || 'Could not fetch channel messages' }
  }

  // Extract VLESS, VMess, and Trojan links via regular expressions
  const linkSet = new Set<string>()

  // Decode HTML entities if any (like &amp; into &)
  const decodedContent = content
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')

  const matches = decodedContent.match(/(?:vless|vmess|trojan):\/\/[^\s<>"'`]+/gi) || []

  for (const raw of matches) {
    // Clean any trailing markdown formatting characters: ), ], *, _, `, etc.
    const clean = raw.trim().replace(/[\)\]\*\_\`]+$/, '')
    if (clean.length > 20) {
      linkSet.add(clean)
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
