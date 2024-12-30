import dayjs from '@/utils/dayjs'
import { R } from '@/utils/R'
import { dialog, ipcMain, shell } from 'electron'
import { Workbook } from 'exceljs'
import fs, { existsSync, mkdirSync } from 'fs'
import { copy } from 'fs-extra'
import path, { join } from 'path'
import { ScanObject, ScanRule, Snapshot } from '../types'
import {
  ExportScanDataParams,
  GetScanPageListPrams,
  GetScanPageListResult,
  GetSnapshotParams,
  HandleType,
  SaveScanDataParams,
  ScanHistory,
} from '../types/handle'
import database from './database'
import wkrc, { WkrcType } from './wkrc'

export function expose(app: Electron.App) {
  ipcMain.handle(
    HandleType.SAVE_SCAN_OBJECT,
    async (event, scanObject: Omit<ScanObject, 'id'> & { id?: number }) => {
      const id = scanObject.id
      const scanObjectsChain = database.getBaseDB().chain.get('scanObjects')

      const scanObjectExists = scanObjectsChain
        .find((sb) => sb.scanObjectValue === scanObject.scanObjectValue)
        .value()

      if (scanObjectExists && scanObjectExists.id !== id) {
        return R.duplicate().setMessage('扫码对象名称重复')
      }

      if (id) {
        const chain = scanObjectsChain.find((sb) => sb.id === id)
        const oldScanObject = chain.value()
        const oldPath = join(
          wkrc.get().workDir,
          `data/${oldScanObject.scanObjectValue}`,
        )
        const newPath = join(
          wkrc.get().workDir,
          `data/${scanObject.scanObjectValue}`,
        )
        if (fs.existsSync(oldPath)) {
          fs.renameSync(oldPath, newPath)
        }
        chain.assign(scanObject).commit()
      } else {
        scanObjectsChain
          .push({
            ...scanObject,
            id: scanObjectsChain.value().length + 1,
          })
          .commit()
      }
      await database.getBaseDB().write()
      return R.success()
    },
  )

  ipcMain.handle(HandleType.GET_SCAN_OBJECT_LIST, async (event) => {
    const scanObjects = database.getBaseDB().chain.get('scanObjects').value()
    return R.success<ScanObject[]>().setData(scanObjects)
  })

  ipcMain.handle(HandleType.DELETE_SCAN_OBJECT, async (event, id: number) => {
    const scanObjectsChain = database.getBaseDB().chain.get('scanObjects')
    const scanObjectExists = scanObjectsChain.find((sb) => sb.id === id)
    if (!scanObjectExists) {
      return R.error().setMessage('扫码对象不存在')
    }
    scanObjectsChain.remove((sb) => sb.id === id).commit()
    return R.success()
  })

  ipcMain.handle(
    HandleType.SAVE_SCAN_RULE,
    async (event, scanRule: Omit<ScanRule, 'id'> & { id?: number }) => {
      const id = scanRule.id
      const scanRulesChain = database.getBaseDB().chain.get('scanRules')
      const scanRuleExists = scanRulesChain
        .find((sr) => sr.scanRuleValue === scanRule.scanRuleValue)
        .value()

      if (scanRuleExists && scanRuleExists.id !== id) {
        return R.duplicate().setMessage('扫码规则名称重复')
      }
      if (id) {
        scanRulesChain
          .map((sr) => {
            if (scanRule.isDefault) {
              sr.isDefault = false
            }
            return sr
          })
          .find((sr) => sr.id === id)
          .assign(scanRule)
          .commit()
      } else {
        scanRulesChain
          .push({ ...scanRule, id: scanRulesChain.value().length + 1 })
          .map((sr) => {
            if (scanRule.isDefault) {
              sr.isDefault = false
            }
            return sr
          })
          .commit()
      }
      await database.getBaseDB().write()
      return R.success()
    },
  )

  ipcMain.handle(HandleType.GET_SCAN_RULE_LIST, async (event) => {
    const scanRules = database.getBaseDB().chain.get('scanRules').value()
    return R.success<ScanRule[]>().setData(scanRules)
  })

  ipcMain.handle(HandleType.DELETE_SCAN_RULE, async (event, id: number) => {
    const scanRulesChain = database.getBaseDB().chain.get('scanRules')
    const scanRuleExists = scanRulesChain.find((sr) => sr.id === id)
    if (!scanRuleExists) {
      return R.error().setMessage('扫码规则不存在')
    }
    scanRulesChain.remove((sr) => sr.id === id).commit()
    return R.success()
  })

  ipcMain.handle(
    HandleType.SAVE_SCAN_DATA,
    async (event, { scanDate, scanObject, data }: SaveScanDataParams) => {
      const scanDB = database.getScanDB({
        scanDate: scanDate,
        scanObject,
      })
      const chain = scanDB.chain.get('scanList')
      const scanExists = chain
        .some((scan) => scan.qrcode === data.qrcode)
        .value()
      if (scanExists) {
        return R.duplicate().setMessage('当前扫描的条码重复!')
      }
      chain.push(data).commit()
      await scanDB.write()
      return R.success()
    },
  )

  ipcMain.handle(
    HandleType.GET_SCAN_PAGE_LIST,
    async (
      event,
      { scanDate, scanObject, current, size, qrcode }: GetScanPageListPrams,
    ) => {
      const scanDB = database.getScanDB({
        scanDate,
        scanObject,
      })
      const scanListChain = scanDB.chain.get('scanList')
      let query = scanListChain
      if (qrcode) {
        query = query.filter((scan) => scan.qrcode.includes(qrcode))
      }
      const records = query
        .sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix())
        .slice((current - 1) * size, current * size)
        .value()
      return R.success<GetScanPageListResult>().setData({
        records,
        current,
        size,
        total: scanListChain.value().length,
      })
    },
  )

  ipcMain.handle(
    HandleType.GET_SNAPSHOT,
    async (event, { scanObject, scanDate }: GetSnapshotParams) => {
      const scanDB = database.getScanDB({
        scanDate,
        scanObject,
      })

      const scanList = scanDB.chain.get('scanList').value()
      const hourCapacityMap = new Map<number, number>()

      // 按小时分组扫描数据
      scanList.forEach((scan) => {
        const hour = dayjs(scan.date).hour()
        hourCapacityMap.set(hour, (hourCapacityMap.get(hour) ?? 0) + 1)
      })

      // 获取最近一小时的扫描数
      const hours = Array.from(hourCapacityMap.keys()).sort((k1, k2) => k2 - k1)
      const currentHour = hours[0]
      const previousHour = hours[1]
      const lastHourCapacity = hourCapacityMap.get(currentHour) ?? 0

      // 计算每小时平均扫描速度
      const speed =
        hourCapacityMap.size > 0 ? scanList.length / hourCapacityMap.size : 0

      // 计算增长率
      const growth = previousHour
        ? ((hourCapacityMap.get(currentHour) ?? 0) -
            (hourCapacityMap.get(previousHour) ?? 0)) /
          (hourCapacityMap.get(previousHour) ?? 1)
        : 0

      // 生成图表数据
      const charData = Array.from(hourCapacityMap.keys())
        .sort((k1, k2) => k1 - k2)
        .map((hour) => ({
          time: dayjs().hour(hour).format('HH:00'),
          capacity: hourCapacityMap.get(hour) ?? 0,
        }))

      const snapshot: Snapshot = {
        speed,
        lastHourCapacity,
        totalCapacity: scanList.length,
        growth,
        charData,
      }

      return R.success<Snapshot>().setData(snapshot)
    },
  )

  ipcMain.handle(
    HandleType.GET_SCAN_HISTORY,
    async (event, scanObject: ScanObject) => {
      const dataDirs = fs.readdirSync(
        join(wkrc.get().workDir, `data/${scanObject.scanObjectValue}`),
      )
      const data = dataDirs.map((dir) => {
        return {
          date: dayjs(dir).format('YYYY-MM-DD'),
          name: `${scanObject.scanObjectName}-${dayjs(dir).format('YYYY-MM-DD')}`,
        }
      })
      return R.success<ScanHistory[]>().setData(data)
    },
  )

  ipcMain.handle(
    HandleType.EXPORT_SCAN_DATA,
    async (event, { scanObject, scanDates }: ExportScanDataParams) => {
      scanDates.forEach((scanDate) => {
        try {
          exportScanData(scanObject, scanDate)
        } catch (error) {
          return R.error().setMessage(
            `${scanObject.scanObjectName}[${scanDate}]导出失败`,
          )
        }
      })
      return R.success()
    },
  )

  ipcMain.handle(
    HandleType.OPEN_EXPORT_EXPLORER,
    async (event, scanObject: ScanObject) => {
      const dir = path.join(
        wkrc.get().workDir,
        `downloads/${scanObject.scanObjectName}`,
      )
      shell.openPath(dir)
      return R.success()
    },
  )

  ipcMain.handle(HandleType.EXPORT_SCAN_WORKDIR, async (event) => {
    const paths = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    })
    if (paths.canceled) {
      return { success: true, message: '操作取消' }
    }
    const selectPath = join(paths.filePaths[0], 'wk/wk-scan')
    const sourcePath = join(wkrc.get().workDir)
    try {
      await copy(sourcePath, selectPath, { recursive: true })
      return R.success().setData(selectPath)
    } catch (err) {
      return R.error().setMessage('数据源导出失败')
    }
  })

  ipcMain.handle(HandleType.GET_WKRC, async (event) => {
    return R.success<WkrcType>().setData(wkrc.get())
  })

  ipcMain.handle(HandleType.SAVE_WKRC, async (event, w: WkrcType) => {
    wkrc.set(w)
    database.loadBaseDB()
    return R.success()
  })
}

async function exportScanData(scanObject: ScanObject, scanDate: string) {
  const workbook = new Workbook()
  const worksheet = workbook.addWorksheet('导出数据')
  const scanList = database
    .getScanDB({
      scanDate,
      scanObject,
    })
    .chain.get('scanList')
    .value()

  worksheet.columns = [
    { header: '扫码对象名称', key: 'scanObjectName', width: 20 },
    { header: '扫码对象条码', key: 'qrcode', width: 30 },
    { header: '测试状态', key: 'state', width: 20 },
    { header: '扫码时间', key: 'date', width: 20 },
  ]

  scanList
    .map((scan) => ({
      ...scan,
      state: '测试通过',
      date: dayjs(scan.date).format('YYYY/MM/DD HH:mm:ss'),
    }))
    .forEach((item) => {
      worksheet.addRow(item)
    })

  const dir = path.join(
    wkrc.get().workDir,
    `downloads/${scanObject.scanObjectName}`,
  )
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  const buffer = await workbook.xlsx.writeBuffer()
  fs.writeFileSync(join(dir, `${scanDate}.xlsx`), new Uint8Array(buffer))
}
