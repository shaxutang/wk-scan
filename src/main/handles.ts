import dayjs from '@/utils/dayjs'
import { R } from '@/utils/R'
import { BrowserWindow, dialog, ipcMain, shell } from 'electron'
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

const i18n: Record<string, Record<string, string>> = {
  zh: {
    scanObjectName: '扫码对象名称',
    qrcode: '扫码对象条码',
    state: '测试状态',
    date: '扫码时间',
    duplicateScanObject: '扫码对象名称重复',
    scanObjectNotExist: '扫码对象不存在',
    duplicateScanRule: '扫码规则名称重复',
    scanRuleNotExist: '扫码规则不存在',
    duplicateQrcode: '当前扫描的条码重复!',
    exportFailed: '导出失败',
    operationCanceled: '操作取消',
    exportDataSourceFailed: '数据源导出失败',
    exportData: '导出数据',
  },
  en: {
    scanObjectName: 'Scan Object Name',
    qrcode: 'Scan Object QR Code',
    state: 'Test Status',
    date: 'Scan Time',
    duplicateScanObject: 'Duplicate scan object name',
    scanObjectNotExist: 'Scan object does not exist',
    duplicateScanRule: 'Duplicate scan rule name',
    scanRuleNotExist: 'Scan rule does not exist',
    duplicateQrcode: 'Current scanned QR code is duplicate!',
    exportFailed: 'Export failed',
    operationCanceled: 'Operation canceled',
    exportDataSourceFailed: 'Failed to export data source',
    exportData: 'Export Data',
  },
  vi: {
    scanObjectName: 'Tên đối tượng quét',
    qrcode: 'Mã QR đối tượng quét',
    state: 'Trạng thái kiểm tra',
    date: 'Thời gian quét',
    duplicateScanObject: 'Tên đối tượng quét trùng lặp',
    scanObjectNotExist: 'Đối tượng quét không tồn tại',
    duplicateScanRule: 'Tên quy tắc quét trùng lặp',
    scanRuleNotExist: 'Quy tắc quét không tồn tại',
    duplicateQrcode: 'Mã QR quét hiện tại bị trùng lặp!',
    exportFailed: 'Xuất thất bại',
    operationCanceled: 'Thao tác đã hủy',
    exportDataSourceFailed: 'Xuất nguồn dữ liệu thất bại',
    exportData: 'Xuất dữ liệu',
  },
  jap: {
    scanObjectName: 'スキャンオブジェクト名',
    qrcode: 'スキャンオブジェクトQRコード',
    state: 'テストステータス',
    date: 'スキャン時間',
    duplicateScanObject: 'スキャンオブジェクト名が重複しています',
    scanObjectNotExist: 'スキャンオブジェクトが存在しません',
    duplicateScanRule: 'スキャンルール名が重複しています',
    scanRuleNotExist: 'スキャンルールが存在しません',
    duplicateQrcode: '現在スキャンされたQRコードが重複しています！',
    exportFailed: 'エクスポートに失敗しました',
    operationCanceled: '操作がキャンセルされました',
    exportDataSourceFailed: 'データソースのエクスポートに失敗しました',
    exportData: 'データをエクスポート',
  },
}

export function expose(app: Electron.App, mainWindow: BrowserWindow) {
  ipcMain.handle(
    HandleType.SAVE_SCAN_OBJECT,
    async (event, scanObject: Omit<ScanObject, 'id'> & { id?: number }) => {
      const id = scanObject.id
      const scanObjectsChain = database.getBaseDB().chain.get('scanObjects')

      const scanObjectExists = scanObjectsChain
        .find((sb) => sb.scanObjectValue === scanObject.scanObjectValue)
        .value()

      if (scanObjectExists && scanObjectExists.id !== id) {
        return R.duplicate().setMessage(
          i18n[wkrc.get().language].duplicateScanObject,
        )
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
      return R.error().setMessage(i18n[wkrc.get().language].scanObjectNotExist)
    }
    scanObjectsChain.remove((sb) => sb.id === id).commit()
    database.getBaseDB().write()
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
        return R.duplicate().setMessage(
          i18n[wkrc.get().language].duplicateScanRule,
        )
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
      return R.error().setMessage(i18n[wkrc.get().language].scanRuleNotExist)
    }
    scanRulesChain.remove((sr) => sr.id === id).commit()
    await database.getBaseDB().write()
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
        return R.duplicate().setMessage(
          i18n[wkrc.get().language].duplicateQrcode,
        )
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

      scanList.forEach((scan) => {
        const hour = dayjs(scan.date).hour()
        hourCapacityMap.set(hour, (hourCapacityMap.get(hour) ?? 0) + 1)
      })

      const hours = Array.from(hourCapacityMap.keys()).sort((k1, k2) => k2 - k1)
      const currentHour = hours[0]
      const previousHour = hours[1]
      const lastHourCapacity = hourCapacityMap.get(currentHour) ?? 0

      const speed =
        hourCapacityMap.size > 0 ? scanList.length / hourCapacityMap.size : 0

      const growth = previousHour
        ? ((hourCapacityMap.get(currentHour) ?? 0) -
            (hourCapacityMap.get(previousHour) ?? 0)) /
          (hourCapacityMap.get(previousHour) ?? 1)
        : 0

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
    async (event, scanObject: ScanObject, year = dayjs().format('YYYY')) => {
      const yearPath = join(
        wkrc.get().workDir,
        `data/${scanObject.scanObjectValue}/${year}`,
      )
      if (!fs.existsSync(yearPath)) {
        return R.success<ScanHistory[]>().setData([])
      }

      const months = fs.readdirSync(yearPath)
      const data: ScanHistory[] = []

      months.forEach((month) => {
        const monthPath = join(yearPath, month)
        const days = fs.readdirSync(monthPath)

        days.forEach((day) => {
          const dataPath = join(monthPath, day, 'data.json')
          if (fs.existsSync(dataPath)) {
            const date = `${year}-${month}-${day}`
            data.push({
              date,
              name: date,
            })
          }
        })
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
            `${scanObject.scanObjectName}[${scanDate}]${i18n[wkrc.get().language].exportFailed}`,
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
      return {
        success: true,
        message: i18n[wkrc.get().language].operationCanceled,
      }
    }
    const selectPath = join(paths.filePaths[0], 'wk-scan')
    const sourcePath = join(wkrc.get().workDir)
    try {
      await copy(sourcePath, selectPath)
      return R.success().setData(selectPath)
    } catch (err) {
      return R.error().setMessage(
        i18n[wkrc.get().language].exportDataSourceFailed,
      )
    }
  })

  ipcMain.handle(HandleType.GET_WKRC, async (event) => {
    return R.success<WkrcType>().setData(wkrc.get())
  })

  ipcMain.handle(HandleType.SAVE_WKRC, async (event, w: WkrcType) => {
    wkrc.set(w)
    database.loadBaseDB()
    database.loadScanDB()
    return R.success()
  })

  ipcMain.handle(HandleType.SELECT_FOLDER, async (event) => {
    const paths = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    })
    if (paths.canceled) {
      return {
        success: true,
        message: i18n[wkrc.get().language].operationCanceled,
      }
    }
    return R.success().setData(paths.filePaths[0])
  })

  ipcMain.handle(HandleType.SET_FULLSCREEN_STATE, async (event, state) => {
    if (mainWindow) {
      mainWindow.setFullScreen(state)
    }
    return R.success()
  })

  ipcMain.handle(HandleType.GET_FULLSCREEN_STATE, async (event) => {
    if (mainWindow) {
      return R.success().setData(mainWindow.isFullScreen())
    }
    return R.success().setData(false)
  })
}

async function exportScanData(scanObject: ScanObject, scanDate: string) {
  const workbook = new Workbook()
  const worksheet = workbook.addWorksheet(i18n[wkrc.get().language].exportData)
  const scanList = database
    .getScanDB({
      scanDate,
      scanObject,
    })
    .chain.get('scanList')
    .value()

  worksheet.columns = [
    {
      header: i18n[wkrc.get().language].scanObjectName,
      key: 'scanObjectName',
      width: 20,
    },
    {
      header: i18n[wkrc.get().language].qrcode,
      key: 'qrcode',
      width: 30,
    },
    {
      header: i18n[wkrc.get().language].state,
      key: 'state',
      width: 20,
    },
    {
      header: i18n[wkrc.get().language].date,
      key: 'date',
      width: 20,
    },
  ]

  scanList
    .map((scan) => ({
      ...scan,
      state: 'Pass',
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
