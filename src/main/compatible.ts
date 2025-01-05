/**
 * 数据迁移和兼容性处理模块
 *
 * 该模块负责处理旧版本数据的迁移和兼容性转换,包括:
 * - 扫描对象数据迁移
 * - 扫描规则数据迁移
 * - 目录结构调整
 * - 数据格式转换
 */

import { ScanObject, ScanRule } from '@/types'
import dayjs from '@/utils/dayjs'
import fs, { mkdirSync } from 'fs'
import os from 'os'
import { join } from 'path'
import { BaseDBType, ScanDBType } from './database'
import { scanObjects, scanRules } from './default'
import output from './output'
import wkrc from './wkrc'

/**
 * 旧版本扫描数据类型
 */
export interface DataType {
  productName: string
  productValue: string
  qrcode: string
  date: number
}

/**
 * 产品信息类型
 */
export interface Product {
  productName: string
  productValue: string
}

/**
 * 规则信息类型
 */
export interface Rule {
  ruleName: string
  ruleValue: string
  isDefault: boolean
}

/**
 * 创建目录(如果不存在)
 * @param path 目录路径
 */
const createDirectoryIfNotExists = (path: string) => {
  if (!fs.existsSync(path)) {
    mkdirSync(path, { recursive: true })
    output(`创建目录: ${path}`)
  }
}

/**
 * 处理旧版本扫描数据
 * @param oldData 旧数据
 * @param product 产品信息
 * @param existingScanList 现有扫描列表
 * @returns 处理后的扫描数据
 */
const processOldScanData = (
  oldData: DataType[],
  product: Product,
  existingScanList: any[] = [],
) => {
  const startId = existingScanList.length + 1
  return oldData.map((data, index) => ({
    id: startId + index,
    scanObjectName: product.productName,
    scanObjectValue: product.productValue,
    qrcode: data.qrcode,
    date: data.date,
  }))
}

/**
 * 去重并重新索引扫描列表
 * @param scanList 扫描列表
 * @returns 处理后的扫描列表
 */
const deduplicateAndReindexScanList = (scanList: any[]) => {
  const deduplicated = Array.from(
    new Map(scanList.map((item) => [item.qrcode, item])).values(),
  )
  return deduplicated.map((item, index) => ({
    ...item,
    id: index + 1,
  }))
}

/**
 * 处理产品扫描数据的兼容性
 * @param product 产品信息
 */
const compatibleScanData = (product: Product) => {
  const oldPath = join(os.homedir(), 'wk/qr-scan/product', product.productValue)
  const newBasePath = join(wkrc.get().workDir, 'data', product.productValue)

  if (!fs.existsSync(oldPath)) return

  output(`开始处理产品 ${product.productName} 的扫描数据`)
  try {
    createDirectoryIfNotExists(newBasePath)

    const oldDirs = fs.readdirSync(oldPath)

    oldDirs
      .filter((dir) => dayjs(dir).isValid())
      .forEach((dir) => {
        try {
          const oldDataPath = join(oldPath, dir, 'data.json')
          if (!fs.existsSync(oldDataPath)) return

          const readOldData =
            (JSON.parse(fs.readFileSync(oldDataPath, 'utf-8')) as DataType[]) ||
            []

          const date = dayjs(dir)
          const year = date.format('YYYY')
          const month = date.format('MM')
          const day = date.format('DD')
          const newPath = join(newBasePath, year, month, day)
          const newDataPath = join(newPath, 'data.json')

          if (!fs.existsSync(newPath)) {
            createDirectoryIfNotExists(newPath)
            const processedData = processOldScanData(readOldData, product)
            const scanData: ScanDBType = {
              scanList: processedData,
              scanDate: `${year}-${month}-${day}`,
            }

            fs.writeFileSync(newDataPath, JSON.stringify(scanData, null, 2))
            output(`创建新的扫描数据文件: ${newDataPath}`)
          } else {
            const newScanData: ScanDBType = JSON.parse(
              fs.readFileSync(newDataPath, 'utf-8'),
            )

            const processedData = processOldScanData(
              readOldData,
              product,
              newScanData.scanList,
            )
            newScanData.scanList.push(...processedData)
            newScanData.scanList = deduplicateAndReindexScanList(
              newScanData.scanList,
            )

            fs.writeFileSync(newDataPath, JSON.stringify(newScanData, null, 2))
            output(`更新扫描数据文件: ${newDataPath}`)
          }
        } catch (err) {
          output(`处理目录 ${dir} 时出错: ${err.message}`)
        }
      })
  } catch (err) {
    output(`处理产品 ${product.productValue} 时出错: ${err.message}`)
  }
}

/**
 * 迁移现有目录结构到新格式
 * @param productValue 产品值
 */
const migrateExistingDirectoryStructure = (scanDateDir: string) => {
  const basePath = join(wkrc.get().workDir, 'data', scanDateDir)
  if (!fs.existsSync(basePath)) return

  output(`开始迁移目录结构: ${scanDateDir}`)
  try {
    const dateDirs = fs.readdirSync(basePath)
    dateDirs.forEach((dateDir) => {
      // 检查是否符合YYYY-MM-DD格式
      const dateMatch = dateDir.match(/^(\d{4})-(\d{2})-(\d{2})$/)
      if (!dateMatch) return

      const [_, year, month, day] = dateMatch
      const oldPath = join(basePath, dateDir)
      const oldDataPath = join(oldPath, 'data.json')

      if (!fs.existsSync(oldDataPath)) return

      const newPath = join(basePath, year, month, day)
      const newDataPath = join(newPath, 'data.json')

      if (!fs.existsSync(newPath)) {
        createDirectoryIfNotExists(newPath)
        const scanData = JSON.parse(fs.readFileSync(oldDataPath, 'utf-8'))
        fs.writeFileSync(newDataPath, JSON.stringify(scanData, null, 2))
        fs.rmSync(oldPath, { recursive: true })
        output(`迁移数据从 ${oldPath} 到 ${newPath}`)
      }
    })
  } catch (err) {
    output(`迁移目录结构 ${scanDateDir} 时出错: ${err.message}`)
  }
}

/**
 * 迁移所有产品的目录结构
 */
const migrateAllExistingDirectories = () => {
  const dataPath = join(wkrc.get().workDir, 'data')
  if (!fs.existsSync(dataPath)) return

  output('开始迁移所有产品目录结构')
  try {
    const scanDateDirs = fs.readdirSync(dataPath)
    scanDateDirs.forEach((scanDateDir) => {
      const productPath = join(dataPath, scanDateDir)
      if (fs.statSync(productPath).isDirectory()) {
        migrateExistingDirectoryStructure(scanDateDir)
      }
    })
  } catch (err) {
    output(`迁移所有目录时出错: ${err.message}`)
  }
}

/**
 * 重命名旧目录
 */
const renameOldDir = () => {
  const oldPath = join(os.homedir(), 'wk/qr-scan')
  let newPath = join(os.homedir(), 'wk/qr-scan-backup')

  try {
    if (fs.existsSync(oldPath)) {
      let counter = 1
      while (fs.existsSync(newPath)) {
        newPath = join(os.homedir(), `wk/qr-scan-backup-${counter}`)
        counter++
      }
      fs.renameSync(oldPath, newPath)
      output(`重命名旧目录: ${oldPath} -> ${newPath}`)
    }
  } catch (err) {
    output(`重命名旧目录时出错: ${err.message}`)
  }
}

/**
 * 处理扫描对象数据
 * @param products 产品列表
 * @param baseData 基础数据
 */
const processScanObjects = (products: Product[], baseData: BaseDBType) => {
  output('开始处理扫描对象数据')
  products.forEach((product: Product) => {
    const scanObjectExists = baseData.scanObjects.some(
      (scanObject: ScanObject) =>
        scanObject.scanObjectValue === product.productValue,
    )
    if (!scanObjectExists) {
      baseData.scanObjects.push({
        id: baseData.scanObjects.length + 1,
        scanObjectName: product.productName,
        scanObjectValue: product.productValue,
      })
      output(`添加新的扫描对象: ${product.productName}`)
    }
    compatibleScanData(product)
  })
}

/**
 * 处理扫描规则数据
 * @param rules 规则列表
 * @param baseData 基础数据
 */
const processScanRules = (rules: Rule[], baseData: BaseDBType) => {
  output('开始处理扫描规则数据')
  const existingDefaultRule = baseData.scanRules.find((rule) => rule.isDefault)

  rules.forEach((rule: Rule) => {
    const scanRuleExists = baseData.scanRules.some(
      (scanRule: ScanRule) => scanRule.scanRuleValue === rule.ruleValue,
    )
    if (!scanRuleExists) {
      const shouldBeDefault = rule.isDefault && !existingDefaultRule
      baseData.scanRules.push({
        id: baseData.scanRules.length + 1,
        scanRuleName: rule.ruleName,
        scanRuleValue: rule.ruleValue,
        isDefault: shouldBeDefault,
      })
      output(`添加新的扫描规则: ${rule.ruleName}`)
    }
  })
}

/**
 * 执行数据迁移
 * 将旧版本的数据迁移到新的数据结构中
 */
export default function () {
  output('开始执行数据迁移')
  const basePath = join(wkrc.get().workDir, 'data')
  const productPath = join(os.homedir(), 'wk/qr-scan/product')

  // 首先迁移现有的目录结构
  migrateAllExistingDirectories()

  if (!fs.existsSync(productPath)) return

  try {
    createDirectoryIfNotExists(basePath)
    const baseFilePath = join(basePath, 'data.json')

    let baseData: BaseDBType = fs.existsSync(baseFilePath)
      ? JSON.parse(fs.readFileSync(baseFilePath, 'utf-8'))
      : { scanObjects, scanRules }

    const productsPath = join(productPath, 'products.json')
    const rulesPath = join(productPath, 'rules.json')

    if (fs.existsSync(productsPath)) {
      const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8')) || []
      processScanObjects(products, baseData)
    }

    if (fs.existsSync(rulesPath)) {
      const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf-8')) || []
      processScanRules(rules, baseData)
    }

    fs.writeFileSync(baseFilePath, JSON.stringify(baseData, null, 2))
    output(`更新基础数据文件: ${baseFilePath}`)
    renameOldDir()
    output('数据迁移完成')
  } catch (err) {
    output(`数据迁移过程出错: ${err.message}`)
  }
}
