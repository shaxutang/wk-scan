import { ConfigProvider, theme } from 'antd'
import enUS from 'antd/locale/en_US'
import viVN from 'antd/locale/vi_VN'
import zhCN from 'antd/locale/zh_CN'
import { createRoot } from 'react-dom/client'
import { useTranslation } from 'react-i18next'
import { RouterProvider } from 'react-router-dom'
import { useDark } from './hooks/useDark'
import './i18n'
import { router } from './Router'

const App = () => {
  const { isDark } = useDark()
  const { i18n } = useTranslation()

  return (
    <ConfigProvider
      locale={
        i18n.language === 'vi' ? viVN : i18n.language === 'en' ? enUS : zhCN
      }
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  )
}

const root = createRoot(document.getElementById('root'))
root.render(<App />)
