import { Api } from './preload'

declare global {
  interface Window extends Window {
    electron: Api
  }
}

export {}
