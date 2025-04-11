import Clock from '@/components/Clock'
import { useDark } from '@/hooks/useDark'
import { useFullscreen } from '@/hooks/useFullscreen'
import { useScanStore } from '@/stores/useScanStore'
import { cn } from '@/utils/css'
import dayjs from '@/utils/dayjs'
import {
  FullscreenExitOutlined,
  FullscreenOutlined,
  MoonOutlined,
  SunOutlined,
} from '@ant-design/icons'
import { Breadcrumb, Select, Typography } from 'antd'
import { ItemType } from 'antd/es/breadcrumb/Breadcrumb'
import { useTranslation } from 'react-i18next'

export interface HeaderProps {
  breadcrumbs?: ItemType[]
}

const Header: React.FC<HeaderProps> = ({ breadcrumbs }) => {
  const scanStore = useScanStore()
  const scanStoreData = scanStore.scanStoreData
  const { isDark, toggleDarkMode } = useDark()
  const { isFullscreen, toggleFullscreenMode } = useFullscreen()
  const { t, i18n } = useTranslation()
  const { Text } = Typography

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value)
    window.electron.saveWkrc({ language: value })
  }

  return (
    <div
      className={cn(
        'flex min-h-[39px] items-center justify-between border-b border-gray-200 dark:border-gray-700',
        {
          'pl-6 pr-[140px]': !isFullscreen,
          'px-6': isFullscreen,
        },
      )}
    >
      <div className="flex items-center">
        {!!breadcrumbs && (
          <>
            <Breadcrumb items={breadcrumbs} />{' '}
            <Text type="secondary" className="ml-2 text-xs">
              {dayjs(scanStoreData.scanDate).format('YYYY-MM-DD')}
            </Text>
          </>
        )}
      </div>
      <div className="drag h-full flex-auto"></div>
      <div className="flex items-center space-x-3">
        <Clock />
        <Select
          size="small"
          value={i18n.language}
          style={{ width: 100 }}
          variant="filled"
          onChange={handleLanguageChange}
          options={[
            { value: 'zh', label: '简体中文' },
            { value: 'en', label: 'English' },
            { value: 'jap', label: '日本語' },
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
        <div
          className="relative flex h-6 cursor-pointer items-center gap-x-2 rounded-full bg-gray-200 px-2 dark:bg-gray-600"
          onClick={toggleFullscreenMode}
        >
          {isFullscreen ? (
            <FullscreenExitOutlined className="text-xs dark:text-white" />
          ) : (
            <FullscreenOutlined className="text-xs dark:text-white" />
          )}
          <span className="text-[10px] text-gray-500 dark:text-gray-400">
            {isFullscreen ? t('Exit Fullscreen') : t('Fullscreen')}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Header
