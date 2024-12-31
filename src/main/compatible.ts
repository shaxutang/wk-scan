import { ScanObject, ScanRule } from '@/types'
import dayjs from '@/utils/dayjs'
import fs, { mkdirSync } from 'fs'
import os from 'os'
import { join } from 'path'
import { BaseDBType, ScanDBType } from './database'
import { scanObjects, scanRules } from './default'

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

const BASE_PATH = os.homedir()

const compatibleScanData = (product: Product) => {
  const oldPath = join(BASE_PATH, 'wk/qr-scan/product', product.productValue)
  const newPath = join(BASE_PATH, 'wk/wk-scan/data', product.productValue)

  if (!fs.existsSync(oldPath)) {
    return
  }

  if (!fs.existsSync(newPath)) {
    mkdirSync(newPath, { recursive: true })
  }

  const oldDirs = fs.readdirSync(oldPath)
  const newDirs = fs.readdirSync(newPath)

  oldDirs
    .filter((dir) => dayjs(dir).isValid())
    .forEach((dir) => {
      const readOldData =
        (JSON.parse(
          fs.readFileSync(join(oldPath, dir, 'data.json'), 'utf-8'),
        ) as DataType[]) ?? []
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
          JSON.stringify(scanData),
        )
      } else {
        const newData = fs.readFileSync(
          join(newPath, dir, 'data.json'),
          'utf-8',
        )
        const newScanData: ScanDBType = JSON.parse(newData)

        const oldData = readOldData.map((data) => ({
          id: newScanData.scanList.length + 1,
          scanObjectName: product.productName,
          scanObjectValue: product.productValue,
          qrcode: data.qrcode,
          date: data.date,
        }))

        newScanData.scanList.push(...oldData)

        fs.writeFileSync(
          join(newPath, dir, 'data.json'),
          JSON.stringify(newScanData),
        )
      }
    })
}

const renameOldDir = () => {
  const oldPath = join(BASE_PATH, 'wk/qr-scan')
  const newPath = join(BASE_PATH, 'wk/qr-scan-depreated')
  fs.renameSync(oldPath, newPath)
}

export default function () {
  const basePath = join(BASE_PATH, 'wk/wk-scan/data')
  const productPath = join(BASE_PATH, 'wk/qr-scan/product')

  if (!fs.existsSync(productPath)) {
    return
  }

  if (!fs.existsSync(basePath)) {
    mkdirSync(basePath, { recursive: true })
  }

  const baseFilePath = join(basePath, 'base.json')

  let newBaseData: BaseDBType
  let products: Product[]
  let rules: Rule[]

  if (!fs.existsSync(baseFilePath)) {
    newBaseData = {
      scanObjects,
      scanRules,
    }
    fs.writeFileSync(baseFilePath, JSON.stringify(newBaseData))
  } else {
    newBaseData = JSON.parse(
      fs.readFileSync(baseFilePath, 'utf-8'),
    ) as BaseDBType
  }

  const productsPath = join(productPath, 'products.json')
  const rulesPath = join(productPath, 'rules.json')

  if (fs.existsSync(productsPath)) {
    products =
      JSON.parse(
        fs.readFileSync(join(productPath, 'products.json'), 'utf-8'),
      ) ?? []

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
    rules =
      JSON.parse(fs.readFileSync(join(productPath, 'rules.json'), 'utf-8')) ??
      []

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
  fs.writeFileSync(
    join(BASE_PATH, 'wk/wk-scan/data/base.json'),
    JSON.stringify(newBaseData),
  )
  renameOldDir()
}
