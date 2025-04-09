import { ChartData } from '@/pages/scan/Chart'

export interface ScanObject {
  id: number
  scanObjectName: string
  scanObjectValue: string
  materialNumber: string
  scanRuleType: 'default' | 'custom' | 'material-number'
  scanRule: string
}

export interface ScanDataType {
  id: number
  scanObjectName: string
  scanObjectValue: string
  qrcode: string
  date: number
}

export type Snapshot = {
  speed: number
  lastHourCapacity: number
  totalCapacity: number
  growth: number
  charData: ChartData[]
}
