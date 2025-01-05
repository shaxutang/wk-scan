import dayjs from '@/utils/dayjs'
import fs from 'fs'
import { join } from 'path'
import wkrc from './wkrc'

export default function (...message: string[]) {
  const date = dayjs().format('YYYY-MM-DD')
  const logDir = join(wkrc.get().workDir, 'logs')
  const logFile = join(logDir, `${date}.log`)

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }

  const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss')
  const logMessage = `[${timestamp}] ${message.join(' ')}\n`

  fs.appendFileSync(logFile, logMessage)
}
