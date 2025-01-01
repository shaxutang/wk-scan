import fs from 'fs'
import os from 'os'
import { join } from 'path'

export type WkrcType = {
  workDir?: string
  language?: string
}

const fileName = '.wkrc.json'
const filePath = join(os.homedir(), fileName)

class Wkrc {
  private data: WkrcType
  constructor() {
    this.data = (!fs.existsSync(filePath)
      ? (() => {
          const initial = {
            workDir: join(os.homedir(), 'wk/wk-scan'),
            language: 'zh',
          }
          fs.writeFileSync(filePath, JSON.stringify(initial))
          return initial
        })()
      : JSON.parse(fs.readFileSync(filePath, 'utf-8'))) ?? {
      workDir: os.homedir(),
    }
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
}

const wkrc = new Wkrc()

export default wkrc
