import { ScanDataType, ScanObject, ScanRule } from '@/types'
import fs from 'fs'
import lodash from 'lodash'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { join } from 'path'
import compatible from './compatible'
import { scanObjects, scanRules } from './default'
import wkrc from './wkrc'

export type BaseDBType = {
  scanObjects: ScanObject[]
  scanRules: ScanRule[]
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
    compatible()
    this.loadBaseDB()
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

    const scanPath = join(
      wkrc.get().workDir,
      `data/${scanConfig.scanObject.scanObjectValue}/${scanConfig.scanDate}`,
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
    return this.scanDB
  }

  loadBaseDB() {
    const basePath = join(wkrc.get().workDir, 'data')

    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true })
    }

    const baseDBPath = join(basePath, 'base.json')

    let data: BaseDBType = {
      scanObjects,
      scanRules,
    }

    if (fs.existsSync(baseDBPath)) {
      data = JSON.parse(fs.readFileSync(baseDBPath, 'utf-8'))
    }
    this.baseDB = new LowWithLodash(new JSONFile(baseDBPath), data)
  }

  getBaseDB() {
    return this.baseDB
  }
}

const database = new Database()

export default database
