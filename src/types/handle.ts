import { ScanDataType, ScanObject } from '.'

export enum HandleType {
  SAVE_SCAN_OBJECT = 'saveScanObject',
  GET_SCAN_OBJECT_LIST = 'getScanObjectList',
  DELETE_SCAN_OBJECT = 'deleteScanObject',
  SAVE_SCAN_DATA = 'saveScanData',
  GET_SCAN_PAGE_LIST = 'getScanPageList',
  GET_SNAPSHOT = 'getSnapshot',
  GET_SCAN_HISTORY = 'getScanHistory',
  EXPORT_SCAN_DATA = 'exportScanData',
  OPEN_EXPORT_EXPLORER = 'openExportExplorer',
  EXPORT_SCAN_WORKDIR = 'exportScanWorkdir',
  GET_WKRC = 'getWkrc',
  SAVE_WKRC = 'saveWkrc',
  SELECT_FOLDER = 'selectFolder',
  GET_FULLSCREEN_STATE = 'getFullscreenState',
  SET_FULLSCREEN_STATE = 'setFullscreenState',
  TOGGLE_TITLE_BAR_OVERLAY = 'toggleTitleBarOverlay',
}

export type SaveScanDataParams = {
  scanObject: ScanObject
  scanDate: string
  data: ScanDataType
}

export type GetScanPageListPrams = {
  qrcode?: string
  scanObject: ScanObject
  scanDate: string
  current: number
  size: number
}

export type GetScanPageListResult = {
  records: ScanDataType[]
  total: number
  size: number
  current: number
}

export type GetSnapshotParams = {
  scanObject: ScanObject
  scanDate: string
}

export type ScanHistory = {
  name: string
  date: string
}

export type ExportScanDataParams = {
  scanObject: ScanObject
  scanDates: string[]
}

export type TitlebarOverlayTheme = 'light' | 'dark'
