import { UnorderedListOutlined } from '@ant-design/icons'
import { Button, Drawer } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ScanTable from './ScanTable'

const ScanListButton: React.FC = () => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const onOpen = () => {
    setOpen(true)
  }

  const onClose = () => {
    setOpen(false)
  }
  return (
    <>
      <Button
        type="text"
        size="small"
        icon={<UnorderedListOutlined />}
        onClick={onOpen}
      >
        {t('Scan List')}
      </Button>
      <Drawer
        title={t('Scan List')}
        placement="right"
        width="80vw"
        open={open}
        onClose={onClose}
        destroyOnClose
      >
        <ScanTable />
      </Drawer>
    </>
  )
}
export default ScanListButton
