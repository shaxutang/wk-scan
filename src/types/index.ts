import { ChartData } from '@/pages/scan/Chart'

export interface ScanObject {
  id: number
  scanObjectName: string
  scanObjectValue: string
}

export interface ScanRule {
  id: number
  scanRuleName: string
  scanRuleValue: string
  isDefault: boolean
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
