import { ScanObject } from '@/types'
import os from 'os'
import { join } from 'path'
import { WkrcType } from './wkrc'

export const wkrc: WkrcType = {
  workDir: join(os.homedir(), 'wk/wk-scan'),
  language: 'zh',
  internet: false,
  host: '',
}

export const scanObjects: ScanObject[] = [
  {
    id: 1,
    scanObjectName: '通用扫码对象',
    scanObjectValue: 'common',
    scanRuleType: 'default',
    scanRule: '.*',
    materialNumber: '0000000',
  },
]
