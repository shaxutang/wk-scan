import { useDark } from '@/hooks/useDark'
import { useScanStore } from '@/stores/useScanStore'
import dayjs from '@/utils/dayjs'
import { LeftOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Select, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const Header: React.FC = () => {
  const scanStore = useScanStore()
  const scanStoreData = scanStore.scanStoreData
  const { isDark, toggleDarkMode } = useDark()
  const { t, i18n } = useTranslation()
  const { Title, Text } = Typography

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value)
    window.electron.saveWkrc({ language: value })
  }

  return (
    <div className="flex h-14 items-center justify-between border-b border-gray-200 px-6 dark:border-gray-700">
      <Link
        to="/"
        className="flex items-center space-x-2 text-primary transition-opacity hover:opacity-80"
      >
        <LeftOutlined className="align-middle text-sm" />
        <span className="text-sm">{t('Select New Scan Object')}</span>
      </Link>

      <div className="flex flex-col items-center">
        <Title level={4} className="!mb-0 dark:text-white">
          {scanStoreData.scanObject.scanObjectName}
        </Title>
        <Text type="secondary" className="text-xs">
          {dayjs(scanStoreData.scanDate).format('YYYY-MM-DD')}
        </Text>
      </div>

      <div className="flex items-center space-x-3">
        <Select
          size="small"
          value={i18n.language}
          style={{ width: 100 }}
          variant="filled"
          onChange={handleLanguageChange}
          options={[
            { value: 'zh', label: '简体中文' },
            { value: 'en', label: 'English' },
            { value: 'vi', label: 'Tiếng Việt' },
          ]}
        />

        <div
          className="relative h-6 w-[80px] cursor-pointer rounded-full bg-gray-200 p-1 dark:bg-gray-600"
          onClick={toggleDarkMode}
        >
          <div className="flex h-full w-full items-center justify-between px-2 text-[10px] text-gray-500 dark:text-gray-400">
            <span>{t('Light')}</span>
            <span>{t('Dark')}</span>
          </div>
          <div
            className="absolute left-0 top-0 flex h-full w-1/2 items-center justify-center transition-transform duration-300"
            style={{
              transform: `translateX(${isDark ? '100%' : '0%'})`,
            }}
          >
            <div className="flex h-4 w-[34px] items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-800 dark:text-white">
              {isDark ? (
                <MoonOutlined className="text-xs" />
              ) : (
                <SunOutlined className="text-xs" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
