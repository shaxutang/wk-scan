import { ScanObject, ScanRule } from '@/types'

export const scanObjects: ScanObject[] = [
  { id: 1, scanObjectName: '气压阀', scanObjectValue: 'qì_yā_fá' },
  {
    id: 2,
    scanObjectName: 'SC下壳-气密测试',
    scanObjectValue: 'SC_xià_ké_-_qì_mì_cè_shì',
  },
  {
    id: 3,
    scanObjectName: 'SC下壳-漏水测试',
    scanObjectValue: 'SC_xià_ké_-_lòu_shuǐ_cè_shì',
  },
  {
    id: 4,
    scanObjectName: 'PSC清洁液箱成品气密测试',
    scanObjectValue: 'PSC_qīng_jié_yè_xiāng_chéng_pǐn_qì_mì_cè_shì',
  },
  {
    id: 5,
    scanObjectName: 'O5清洁液箱成品气密测试',
    scanObjectValue: 'O5_qīng_jié_yè_xiāng_chéng_pǐn_qì_mì_cè_shì',
  },
]

export const scanRules: ScanRule[] = [
  {
    id: 1,
    scanRuleName: '产线18位条码',
    scanRuleValue: '^\\d{7}W\\d{10}$',
    isDefault: true,
  },
]
