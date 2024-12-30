import { useDark } from '@/hooks/useDark'
import { useScanStore } from '@/stores/useScanStore'
import dayjs from '@/utils/dayjs'
import { LeftOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { Link } from 'react-router-dom'

const Header: React.FC = () => {
  const scanStore = useScanStore()
  const scanStoreData = scanStore.scanStoreData
  const { isDark, toggleDarkMode } = useDark()
  return (
    <header className="flex items-center justify-between px-3">
      <Link to="/" className="text-primary space-x-1">
        <LeftOutlined />
        <span>重新选择扫码对象</span>
      </Link>
      <h2 className="text-3xl font-bold dark:text-white">
        {scanStoreData.scanObject.scanObjectName}[
        {dayjs(scanStoreData.scanDate).format('YYYY-MM-DD')}]
      </h2>
      <Button
        type="text"
        size="large"
        icon={isDark ? <MoonOutlined /> : <SunOutlined />}
        onClick={toggleDarkMode}
      >
        {isDark ? '暗黑模式' : '浅色模式'}
      </Button>
    </header>
  )
}

export default Header
