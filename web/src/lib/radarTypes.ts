import { ProxyNode } from './types'

export interface RadarChannel {
  username: string
  enabled: boolean
  addedByUser?: boolean
  lastCheckedAt?: string
  lastStatus?: 'idle' | 'checking' | 'found' | 'empty' | 'error'
  foundCount: number
}

export interface RadarCadence {
  batchSize: number // 1 to 100 channels
  intervalSec: number // 0 to 100 seconds
}

export interface RadarBlip {
  id: string
  channel: string
  angleDeg: number // 0 - 360
  distanceRatio: number // 0.25 - 0.85
  createdAt: number
  status: 'checking' | 'online' | 'empty'
  configTitle?: string
}

export interface InterceptedNode extends ProxyNode {
  sourceChannel: string
  interceptedAt: string
}
