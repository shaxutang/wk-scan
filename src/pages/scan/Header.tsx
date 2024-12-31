import { useDark } from '@/hooks/useDark'
import { useScanStore } from '@/stores/useScanStore'
import dayjs from '@/utils/dayjs'
import { LeftOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'

const Header: React.FC = () => {
  const scanStore = useScanStore()
  const scanStoreData = scanStore.scanStoreData
  const { isDark, toggleDarkMode } = useDark()
  return (
    <header className="flex items-center justify-between px-3 py-4">
      <Link
        to="/"
        className="flex items-center space-x-2 text-primary transition-opacity hover:opacity-80"
      >
        <LeftOutlined className="align-middle" />
        <span className="text-lg">重新选择扫码对象</span>
      </Link>

      <div className="flex flex-col items-center">
        <h2 className="mb-1 text-4xl font-medium dark:text-white">
          {scanStoreData.scanObject.scanObjectName}
        </h2>
        <div className="text-lg text-gray-500 dark:text-gray-400">
          {dayjs(scanStoreData.scanDate).format('YYYY-MM-DD')}
        </div>
      </div>

      <div
        className="relative h-10 w-[120px] cursor-pointer rounded-full bg-gray-200 p-1 dark:bg-gray-600"
        onClick={toggleDarkMode}
      >
        <div className="flex h-full w-full items-center justify-between px-2 text-sm text-gray-500 dark:text-gray-400">
          <span>浅色</span>
          <span>暗黑</span>
        </div>
        <div
          className="absolute left-0 top-0 flex h-full w-1/2 items-center justify-center transition-transform duration-300"
          style={{
            transform: `translateX(${isDark ? '100%' : '0%'})`,
          }}
        >
          <div className="flex h-8 w-[54px] items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-800 dark:text-white">
            {isDark ? <MoonOutlined /> : <SunOutlined />}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
