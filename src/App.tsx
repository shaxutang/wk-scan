import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { useDark } from './hooks/useDark'
import { router } from './Router'

const App = () => {
  const { isDark } = useDark()

  return (
    <ConfigProvider
      locale={zhCN}
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
