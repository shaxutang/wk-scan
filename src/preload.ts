import { contextBridge, ipcRenderer } from 'electron'
import { WkrcType } from './main/wkrc'
import { ScanObject, ScanRule, Snapshot } from './types'
import {
  ExportScanDataParams,
  GetScanPageListPrams,
  GetScanPageListResult,
  GetSnapshotParams,
  HandleType,
  SaveScanDataParams,
  ScanHistory,
} from './types/handle'
import { ResultType } from './utils/R'
// 保存扫描对象
async function saveScanObject(
  scanObject: Omit<ScanObject, 'id'> & { id?: number },
): Promise<ResultType> {
  return ipcRenderer.invoke(HandleType.SAVE_SCAN_OBJECT, scanObject)
}

// 获取扫描对象列表
async function getScanObjectList(): Promise<ResultType<ScanObject[]>> {
  return ipcRenderer.invoke(HandleType.GET_SCAN_OBJECT_LIST)
}

// 删除扫描对象
async function deleteScanObject(id: number): Promise<ResultType> {
  return ipcRenderer.invoke(HandleType.DELETE_SCAN_OBJECT, id)
}

// 保存扫描规则
async function saveScanRule(
  scanRule: Omit<ScanRule, 'id'> & { id?: number },
): Promise<ResultType> {
  return ipcRenderer.invoke(HandleType.SAVE_SCAN_RULE, scanRule)
}

// 获取扫描规则列表
async function getScanRuleList(): Promise<ResultType<ScanRule[]>> {
  return ipcRenderer.invoke(HandleType.GET_SCAN_RULE_LIST)
}

// 删除扫描规则
async function deleteScanRule(id: number): Promise<ResultType> {
  return ipcRenderer.invoke(HandleType.DELETE_SCAN_RULE, id)
}

// 保存扫描数据
async function saveScanData(params: SaveScanDataParams): Promise<ResultType> {
  return ipcRenderer.invoke(HandleType.SAVE_SCAN_DATA, params)
}

// 获取扫描页面列表
async function getScanPageList(
  params: GetScanPageListPrams,
): Promise<ResultType<GetScanPageListResult>> {
  return ipcRenderer.invoke(HandleType.GET_SCAN_PAGE_LIST, params)
}

// 获取快照
async function getSnapshot(
  params: GetSnapshotParams,
): Promise<ResultType<Snapshot>> {
  return ipcRenderer.invoke(HandleType.GET_SNAPSHOT, params)
}

// 获取扫描历史
async function getScanHistory(
  scanObject: ScanObject,
  year: string,
): Promise<ResultType<ScanHistory[]>> {
  return ipcRenderer.invoke(HandleType.GET_SCAN_HISTORY, scanObject, year)
}

// 导出扫描数据
async function exportScanData(
  params: ExportScanDataParams,
): Promise<ResultType> {
  return ipcRenderer.invoke(HandleType.EXPORT_SCAN_DATA, params)
}

// 打开导出文件夹
async function openExportExplorer(scanObject: ScanObject): Promise<ResultType> {
  return ipcRenderer.invoke(HandleType.OPEN_EXPORT_EXPLORER, scanObject)
}

// 导出数据源
async function exportScanWorkdir(): Promise<ResultType> {
  return ipcRenderer.invoke(HandleType.EXPORT_SCAN_WORKDIR)
}

// 获取wkrc
async function getWkrc(): Promise<ResultType<WkrcType>> {
  return ipcRenderer.invoke(HandleType.GET_WKRC)
}

// 保存wkrc
async function saveWkrc(wkrc: WkrcType): Promise<ResultType> {
  return ipcRenderer.invoke(HandleType.SAVE_WKRC, wkrc)
}

// 选择文件夹
async function selectFolder(): Promise<ResultType<string>> {
  return ipcRenderer.invoke(HandleType.SELECT_FOLDER)
}

async function setFullscreenState(fullscreen: boolean): Promise<ResultType> {
  return ipcRenderer.invoke(HandleType.SET_FULLSCREEN_STATE, fullscreen)
}

async function getFullscreenState(): Promise<ResultType<boolean>> {
  return ipcRenderer.invoke(HandleType.GET_FULLSCREEN_STATE)
}

const api = {
  saveScanObject,
  getScanObjectList,
  deleteScanObject,
  saveScanRule,
  getScanRuleList,
  deleteScanRule,
  saveScanData,
  getScanPageList,
  getSnapshot,
  getScanHistory,
  exportScanData,
  openExportExplorer,
  exportScanWorkdir,
  getWkrc,
  saveWkrc,
  selectFolder,
  setFullscreenState,
  getFullscreenState,
}

export type Api = typeof api

contextBridge.exposeInMainWorld('electron', api)
