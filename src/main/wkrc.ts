import fs from 'fs'
import os from 'os'
import { join } from 'path'
import { wkrc as defaultWkrc } from './default'

export type WkrcType =
  | {
      workDir?: string
      language?: string
      internet?: false
      host?: string
      port?: number
    }
  | {
      workDir?: string
      language?: string
      internet?: true
      host: string
      port: number
    }

const fileName = '.wkrc.json'
const filePath = join(os.homedir(), fileName)

class Wkrc {
  private data: WkrcType
  constructor() {
    this.data = (!fs.existsSync(filePath)
      ? (() => {
          const initial = defaultWkrc
          fs.writeFileSync(filePath, JSON.stringify(initial))
          return initial
        })()
      : JSON.parse(fs.readFileSync(filePath, 'utf-8'))) ?? {
      workDir: os.homedir(),
    }
    this.checkWorkDirExists()
  }

  get() {
    return this.data
  }

  set(w: WkrcType) {
    this.data = {
      ...this.data,
      ...w,
    }
    fs.writeFileSync(filePath, JSON.stringify(this.data))
  }

  checkWorkDirExists() {
    if (!fs.existsSync(this.data.workDir)) {
      this.data.workDir = defaultWkrc.workDir
    }
  }
}

const wkrc = new Wkrc()

export default wkrc
