import { useSyncExternalStore } from 'react'
import { ScanObject } from '../types'

export interface ScanStoreData {
  scanObject: ScanObject
  scanDate: number
}

class ScanStore {
  private data: ScanStoreData = null!
  private listeners: Set<() => void> = new Set()

  public setScanStoreData(scanObject: ScanStoreData) {
    this.data = scanObject
    sessionStorage.setItem('storeScanData', JSON.stringify(scanObject))
    this.notify()
  }

  public subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  public getSnapshot = () => {
    if (!this.data) {
      const cacheScanObject = sessionStorage.getItem('storeScanData')
      this.data = cacheScanObject ? JSON.parse(cacheScanObject) : null
    }
    return this.data
  }

  private notify = () => {
    this.listeners.forEach((listener) => listener())
  }
}

const scanStore = new ScanStore()

const listeners = new Set<(data: ScanStoreData) => void>()

export const useScanStore = () => {
  const scanStoreData = useSyncExternalStore(
    scanStore.subscribe,
    scanStore.getSnapshot,
  )

  const setScanStoreData = (value: ScanStoreData) => {
    scanStore.setScanStoreData(value)
    listeners.forEach((listener) => listener(value))
  }

  const onStoreDataChange = (listener: (data: ScanStoreData) => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  return { scanStoreData, setScanStoreData, onStoreDataChange }
}
