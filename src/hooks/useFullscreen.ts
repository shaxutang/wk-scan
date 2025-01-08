import { RCode } from '@/utils/R'
import { useSyncExternalStore } from 'react'

interface FullscreenModeStoreType {
  isFullscreen: boolean
  toggleFullscreenMode: () => void
}

class FullscreenModeStore {
  private isFullscreen: boolean = false
  private listeners: Set<() => void> = new Set()

  constructor() {
    window.electron.getFullscreenState().then((res) => {
      const { code, data } = res
      if (code === RCode.SUCCESS) {
        this.isFullscreen = data
      }
    })
  }

  public toggleFullscreenMode() {
    this.isFullscreen = !this.isFullscreen
    this.updateFullscreen()
    this.notify()
  }

  public subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  public getSnapshot = () => {
    return this.isFullscreen
  }

  private notify = () => {
    this.listeners.forEach((listener) => listener())
  }

  private updateFullscreen() {
    if (this.isFullscreen) {
      window.electron.setFullscreenState(true)
    } else {
      window.electron.setFullscreenState(false)
    }
  }
}

const fullscreenModeStore = new FullscreenModeStore()

export const useFullscreen = (): FullscreenModeStoreType => {
  const isFullscreen = useSyncExternalStore(
    fullscreenModeStore.subscribe,
    fullscreenModeStore.getSnapshot,
  )

  const toggleFullscreenMode = () => {
    fullscreenModeStore.toggleFullscreenMode()
  }

  return { isFullscreen, toggleFullscreenMode }
}
