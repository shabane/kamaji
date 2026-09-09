import { ProxyNode } from './types'

/**
 * Extracts credentials (UUID or password) from raw link
 */
function extractCredentials(node: ProxyNode): string {
  try {
    if (node.protocol === 'vless' || node.protocol === 'trojan') {
      const url = new URL(node.rawLink)
      return url.username || '12345678-1234-1234-1234-123456789abc'
    } else if (node.protocol === 'vmess') {
      const base64Str = node.rawLink.replace('vmess://', '').trim()
      const jsonStr = atob(base64Str.replace(/-/g, '+').replace(/_/g, '/'))
      const data = JSON.parse(jsonStr)
      return data.id || '12345678-1234-1234-1234-123456789abc'
    }
  } catch {
    // fallback
  }
  return '12345678-1234-1234-1234-123456789abc'
}

/**
 * Clean node name for YAML and JSON output
 */
function sanitizeName(name: string, index: number): string {
  const clean = name.replace(/[:[\]{},#*&!|>'"]/g, ' ').replace(/\s+/g, ' ').trim()
  return clean ? `${clean}-${index + 1}` : `Node-${index + 1}`
}

/**
 * Generates a full, ready-to-use Clash Meta (Mihomo) YAML configuration profile.
 */
export function generateClashMetaYaml(nodes: ProxyNode[]): string {
  const workingNodes = nodes.filter((n) => n.status === 'success' || n.status === 'warning')
  const validNodes = workingNodes.length > 0 ? workingNodes : nodes

  const proxyEntries: string[] = []
  const proxyNames: string[] = []

  validNodes.forEach((node, index) => {
    const name = sanitizeName(`${node.flag} ${node.title}`, index)
    proxyNames.push(name)
    const cred = extractCredentials(node)
    const isTls = node.security !== 'none'

    if (node.protocol === 'vless') {
      proxyEntries.push(`  - name: "${name}"
    type: vless
    server: "${node.host}"
    port: ${node.port}
    uuid: "${cred}"
    network: ws
    tls: ${isTls}
    udp: true
    servername: "${node.sni || node.host}"
    ws-opts:
      path: "${node.path || '/'}"
      headers:
        Host: "${node.sni || node.host}"`)
    } else if (node.protocol === 'vmess') {
      proxyEntries.push(`  - name: "${name}"
    type: vmess
    server: "${node.host}"
    port: ${node.port}
    uuid: "${cred}"
    alterId: 0
    cipher: auto
    network: ws
    tls: ${isTls}
    udp: true
    servername: "${node.sni || node.host}"
    ws-opts:
      path: "${node.path || '/'}"
      headers:
        Host: "${node.sni || node.host}"`)
    } else if (node.protocol === 'trojan') {
      proxyEntries.push(`  - name: "${name}"
    type: trojan
    server: "${node.host}"
    port: ${node.port}
    password: "${cred}"
    network: ws
    sni: "${node.sni || node.host}"
    udp: true
    ws-opts:
      path: "${node.path || '/'}"
      headers:
        Host: "${node.sni || node.host}"`)
    }
  })

  const proxyNamesYaml = proxyNames.map((n) => `      - "${n}"`).join('\n')

  return `# =========================================================
# Kamaji Probe • Auto-Generated Clash Meta (Mihomo) Profile
# Generated: ${new Date().toISOString()}
# Working Nodes: ${validNodes.length}
# =========================================================

port: 7890
socks-port: 7891
allow-lan: false
mode: rule
log-level: info
ipv6: false
external-controller: 127.0.0.1:9090

dns:
  enable: true
  listen: 0.0.0.0:1053
  ipv6: false
  default-nameserver:
    - 8.8.8.8
    - 1.1.1.1
  nameserver:
    - https://dns.google/dns-query
    - https://cloudflare-dns.com/dns-query

proxies:
${proxyEntries.join('\n\n')}

proxy-groups:
  - name: PROXY
    type: select
    proxies:
      - AUTO-FASTEST
      - FALLBACK
      - DIRECT
${proxyNamesYaml}

  - name: AUTO-FASTEST
    type: url-test
    url: https://www.gstatic.com/generate_204
    interval: 300
    tolerance: 50
    proxies:
${proxyNamesYaml}

  - name: FALLBACK
    type: fallback
    url: https://www.gstatic.com/generate_204
    interval: 300
    proxies:
${proxyNamesYaml}

rules:
  # Domestic Iranian traffic & National Internet (Bypass)
  - DOMAIN-SUFFIX,ir,DIRECT
  - GEOIP,ir,DIRECT,no-resolve
  # Ad Blocking
  - DOMAIN-KEYWORD,adservice,REJECT
  - DOMAIN-SUFFIX,doubleclick.net,REJECT
  # All other international traffic via Kamaji Proxies
  - MATCH,PROXY
`
}

/**
 * Generates a full Sing-box JSON configuration profile.
 */
export function generateSingboxJson(nodes: ProxyNode[]): string {
  const workingNodes = nodes.filter((n) => n.status === 'success' || n.status === 'warning')
  const validNodes = workingNodes.length > 0 ? workingNodes : nodes

  const outbounds: any[] = []
  const proxyTags: string[] = []

  validNodes.forEach((node, index) => {
    const tag = sanitizeName(`${node.flag} ${node.title}`, index)
    proxyTags.push(tag)
    const cred = extractCredentials(node)
    const isTls = node.security !== 'none'

    if (node.protocol === 'vless') {
      outbounds.push({
        type: 'vless',
        tag,
        server: node.host,
        server_port: node.port,
        uuid: cred,
        transport: {
          type: 'ws',
          path: node.path || '/',
          headers: { Host: node.sni || node.host },
        },
        tls: {
          enabled: isTls,
          server_name: node.sni || node.host,
          insecure: true,
        },
      })
    } else if (node.protocol === 'vmess') {
      outbounds.push({
        type: 'vmess',
        tag,
        server: node.host,
        server_port: node.port,
        uuid: cred,
        security: 'auto',
        transport: {
          type: 'ws',
          path: node.path || '/',
          headers: { Host: node.sni || node.host },
        },
        tls: {
          enabled: isTls,
          server_name: node.sni || node.host,
          insecure: true,
        },
      })
    } else if (node.protocol === 'trojan') {
      outbounds.push({
        type: 'trojan',
        tag,
        server: node.host,
        server_port: node.port,
        password: cred,
        transport: {
          type: 'ws',
          path: node.path || '/',
          headers: { Host: node.sni || node.host },
        },
        tls: {
          enabled: isTls,
          server_name: node.sni || node.host,
          insecure: true,
        },
      })
    }
  })

  const config = {
    log: { level: 'info' },
    dns: {
      servers: [
        { tag: 'google', address: 'https://dns.google/dns-query' },
        { tag: 'local', address: '223.5.5.5', detour: 'direct' },
      ],
    },
    inbounds: [
      {
        type: 'mixed',
        tag: 'mixed-in',
        listen: '127.0.0.1',
        listen_port: 2080,
      },
    ],
    outbounds: [
      {
        type: 'selector',
        tag: 'select',
        outbounds: ['auto-fastest', ...proxyTags, 'direct'],
      },
      {
        type: 'urltest',
        tag: 'auto-fastest',
        outbounds: proxyTags,
        url: 'https://www.gstatic.com/generate_204',
        interval: '3m',
      },
      ...outbounds,
      { type: 'direct', tag: 'direct' },
      { type: 'block', tag: 'block' },
    ],
    route: {
      rules: [
        { geosite: 'category-ads-all', outbound: 'block' },
        { geoip: 'ir', outbound: 'direct' },
        { geosite: 'ir', outbound: 'direct' },
      ],
      auto_detect_interface: true,
    },
  }

  return JSON.stringify(config, null, 2)
}

/**
 * Returns newline-separated links for the top N fastest working nodes.
 */
export function getTopFastestLinks(nodes: ProxyNode[], count: number = 5): string {
  const workingNodes = nodes
    .filter((n) => (n.status === 'success' || n.status === 'warning') && n.latency !== null)
    .sort((a, b) => (a.latency ?? 9999) - (b.latency ?? 9999))

  return workingNodes.slice(0, count).map((n) => n.rawLink).join('\n')
}
