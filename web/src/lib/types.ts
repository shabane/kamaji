export type ProtocolType = 'vless' | 'vmess' | 'trojan'

export type NodeStatus = 'pending' | 'probing' | 'success' | 'warning' | 'failed'

export interface ProxyNode {
  id: string
  rawLink: string
  protocol: ProtocolType
  transport: 'ws'
  title: string
  countryCode: string
  countryName: string
  flag: string
  host: string
  port: number
  path: string
  sni: string
  security: string
  alpn: string
  status: NodeStatus
  latency: number | null
  failReason: string | null
  lossPercent: number
  jitter: number
  sparkline: number[]
}

export type FilterStatus = 'all' | 'working' | 'failed' | 'pending'
export type SortOption = 'fastest' | 'country' | 'protocol' | 'loss'
export type ViewMode = 'grid' | 'table'
export type SourceTab = 'auto' | 'custom' | 'raw'
