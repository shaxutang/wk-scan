import { RCode } from '@/utils/R'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './langs/en'
import vi from './langs/vi'
import zh from './langs/zh'

window.electron.getWkrc().then((res) => {
  const { code, data } = res
  if (code === RCode.SUCCESS) {
    i18n.changeLanguage(data.language)
  }
})

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
    },
    zh: {
      translation: zh,
    },
    vi: {
      translation: vi,
    },
  },
  lng: 'vi',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})
