import { ScanObject, ScanRule } from '@/types'
import dayjs from '@/utils/dayjs'
import fs, { mkdirSync } from 'fs'
import { join } from 'path'
import { BaseDBType, ScanDBType } from './database'
import { scanObjects, scanRules } from './default'
import wkrc from './wkrc'
export interface DataType {
  productName: string
  productValue: string
  qrcode: string
  date: number
}

export interface Product {
  productName: string
  productValue: string
}

export interface Rule {
  ruleName: string
  ruleValue: string
  isDefault: boolean
}

const compatibleScanData = (product: Product) => {
  const oldPath = join(
    wkrc.get().workDir,
    'wk/qr-scan/product',
    product.productValue,
  )
  const newPath = join(
    wkrc.get().workDir,
    'wk/wk-scan/data',
    product.productValue,
  )

  if (!fs.existsSync(oldPath)) {
    return
  }

  try {
    if (!fs.existsSync(newPath)) {
      mkdirSync(newPath, { recursive: true })
    }

    const oldDirs = fs.readdirSync(oldPath)
    const newDirs = fs.readdirSync(newPath)

    oldDirs
      .filter((dir) => dayjs(dir).isValid())
      .forEach((dir) => {
        try {
          const oldDataPath = join(oldPath, dir, 'data.json')
          if (!fs.existsSync(oldDataPath)) {
            return
          }

          const readOldData =
            (JSON.parse(fs.readFileSync(oldDataPath, 'utf-8')) as DataType[]) ||
            []

          if (!newDirs.includes(dir)) {
            const oldData = readOldData.map((data, index) => ({
              id: index + 1,
              scanObjectName: product.productName,
              scanObjectValue: product.productValue,
              qrcode: data.qrcode,
              date: data.date,
            }))
            const scanData: ScanDBType = {
              scanList: oldData,
              scanDate: dir,
            }
            fs.mkdirSync(join(newPath, dir), { recursive: true })
            fs.writeFileSync(
              join(newPath, dir, 'data.json'),
              JSON.stringify(scanData, null, 2),
            )
          } else {
            const newDataPath = join(newPath, dir, 'data.json')
            const newData = fs.readFileSync(newDataPath, 'utf-8')
            const newScanData: ScanDBType = JSON.parse(newData)

            const oldData = readOldData.map((data) => ({
              id: newScanData.scanList.length + 1,
              scanObjectName: product.productName,
              scanObjectValue: product.productValue,
              qrcode: data.qrcode,
              date: data.date,
            }))

            newScanData.scanList.push(...oldData)

            fs.writeFileSync(newDataPath, JSON.stringify(newScanData, null, 2))
          }
        } catch (err) {
          console.error(`Error processing directory ${dir}:`, err)
        }
      })
  } catch (err) {
    console.error(`Error processing product ${product.productValue}:`, err)
  }
}

const renameOldDir = () => {
  const oldPath = join(wkrc.get().workDir, 'wk/qr-scan')
  const newPath = join(wkrc.get().workDir, 'wk/qr-scan-deprecated')

  try {
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath)
    }
  } catch (err) {
    console.error('Error renaming old directory:', err)
  }
}

export default function () {
  const basePath = join(wkrc.get().workDir, 'wk/wk-scan/data')
  const productPath = join(wkrc.get().workDir, 'wk/qr-scan/product')

  if (!fs.existsSync(productPath)) {
    return
  }

  try {
    if (!fs.existsSync(basePath)) {
      mkdirSync(basePath, { recursive: true })
    }

    const baseFilePath = join(basePath, 'base.json')

    let newBaseData: BaseDBType
    let products: Product[] = []
    let rules: Rule[] = []

    if (!fs.existsSync(baseFilePath)) {
      newBaseData = {
        scanObjects,
        scanRules,
      }
    } else {
      const baseFileContent = fs.readFileSync(baseFilePath, 'utf-8')
      newBaseData = JSON.parse(baseFileContent) as BaseDBType
    }

    const productsPath = join(productPath, 'products.json')
    const rulesPath = join(productPath, 'rules.json')

    if (fs.existsSync(productsPath)) {
      const productsContent = fs.readFileSync(productsPath, 'utf-8')
      products = JSON.parse(productsContent) || []

      products.forEach((product: Product) => {
        const scanObjectExists = newBaseData.scanObjects.some(
          (scanObject: ScanObject) =>
            scanObject.scanObjectValue === product.productValue,
        )
        if (!scanObjectExists) {
          newBaseData.scanObjects.push({
            id: newBaseData.scanObjects.length + 1,
            scanObjectName: product.productName,
            scanObjectValue: product.productValue,
          })
        }
        compatibleScanData(product)
      })
    }

    if (fs.existsSync(rulesPath)) {
      const rulesContent = fs.readFileSync(rulesPath, 'utf-8')
      rules = JSON.parse(rulesContent) || []

      rules.forEach((rule: Rule) => {
        const scanRuleExists = newBaseData.scanRules.some(
          (scanRule: ScanRule) => scanRule.scanRuleValue === rule.ruleValue,
        )
        if (!scanRuleExists) {
          newBaseData.scanRules.push({
            id: newBaseData.scanRules.length + 1,
            scanRuleName: rule.ruleName,
            scanRuleValue: rule.ruleValue,
            isDefault: rule.isDefault,
          })
        }
      })
    }

    fs.writeFileSync(baseFilePath, JSON.stringify(newBaseData, null, 2))
    renameOldDir()
  } catch (err) {
    console.error('Error in data migration:', err)
  }
}
