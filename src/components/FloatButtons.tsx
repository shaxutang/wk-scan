import { useDark } from '@/hooks/useDark'
import { useFullscreen } from '@/hooks/useFullscreen'
import { RCode } from '@/utils/R'
import {
  ExportOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  MoonOutlined,
  MoreOutlined,
  SettingOutlined,
  SunOutlined,
} from '@ant-design/icons'
import { FloatButton, message } from 'antd'
import { useNavigate } from 'react-router-dom'

const FloatButtons: React.FC = () => {
  const { isFullscreen, toggleFullscreenMode } = useFullscreen()
  const { isDark, toggleDarkMode } = useDark()
  const navigate = useNavigate()
  const [messageApi, holder] = message.useMessage()

  const onExportDatasource = async () => {
    const { code, message } = await window.electron.exportScanWorkdir()
    if (code === RCode.SUCCESS) {
      messageApi.success('数据源导出成功')
    } else {
      messageApi.error(message)
    }
  }
  return (
    <>
      <FloatButton.Group
        trigger="click"
        type="primary"
        style={{ insetInlineEnd: 24 }}
        icon={<MoreOutlined />}
      >
        <FloatButton
          icon={isDark ? <MoonOutlined /> : <SunOutlined />}
          onClick={toggleDarkMode}
        />
        <FloatButton
          icon={
            isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />
          }
          onClick={toggleFullscreenMode}
        />
        <FloatButton
          icon={<SettingOutlined />}
          onClick={() => navigate('/settings')}
        />
        <FloatButton icon={<ExportOutlined />} onClick={onExportDatasource} />
      </FloatButton.Group>
      {holder}
    </>
  )
}

export default FloatButtons
