import { ScanDataType, ScanObject } from '@/types'
import fs from 'fs'
import lodash from 'lodash'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { join } from 'path'
import { scanObjects } from './default'
import wkrc from './wkrc'

export type BaseDBType = {
  scanObjects: ScanObject[]
}

export type ScanDBType = {
  scanList: ScanDataType[]
  scanDate: string
}

export type DatabaseScanConfig = {
  scanObject: ScanObject
  scanDate: string
}

export class LowWithLodash<T> extends Low<T> {
  chain: lodash.ExpChain<this['data']> = lodash.chain(this).get('data')
}

export class Database {
  private scanConfig: DatabaseScanConfig
  private baseDB: LowWithLodash<BaseDBType>
  private scanDB: LowWithLodash<ScanDBType> = null

  constructor() {
    this.loadBaseDB()
  }

  loadScanDB(scanConfig?: DatabaseScanConfig) {
    scanConfig = scanConfig ?? this.scanConfig

    if (!scanConfig) {
      return
    }

    const [year, month, day] = scanConfig.scanDate.split('-')
    const scanPath = join(
      wkrc.get().workDir,
      `data/${scanConfig.scanObject.scanObjectValue}/${year}/${month}/${day}`,
    )

    if (!fs.existsSync(scanPath)) {
      fs.mkdirSync(scanPath, { recursive: true })
    }

    let data: ScanDBType = {
      scanList: [],
      scanDate: scanConfig.scanDate,
    }

    const scanDBPath = join(scanPath, 'data.json')
    if (fs.existsSync(scanDBPath)) {
      data = JSON.parse(fs.readFileSync(scanDBPath, 'utf-8'))
    } else {
      fs.writeFileSync(scanDBPath, JSON.stringify(data))
    }

    this.scanDB = new LowWithLodash<ScanDBType>(new JSONFile(scanDBPath), data)
  }

  loadBaseDB() {
    const basePath = join(wkrc.get().workDir, 'data')

    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true })
    }

    const baseDBPath = join(basePath, 'base.json')

    let data: BaseDBType = {
      scanObjects,
    }

    if (fs.existsSync(baseDBPath)) {
      data = JSON.parse(fs.readFileSync(baseDBPath, 'utf-8'))
    }
    this.baseDB = new LowWithLodash(new JSONFile(baseDBPath), data)
  }

  getScanDB(scanConfig: DatabaseScanConfig) {
    if (
      this.scanDB &&
      this.scanConfig &&
      this.scanConfig.scanDate === scanConfig.scanDate &&
      this.scanConfig.scanObject.id === scanConfig.scanObject.id
    ) {
      return this.scanDB
    }

    this.scanConfig = scanConfig

    this.loadScanDB(scanConfig)

    return this.scanDB
  }

  getBaseDB() {
    return this.baseDB
  }

  getScanConfig() {
    return this.scanConfig
  }
}

const database = new Database()

export default database
