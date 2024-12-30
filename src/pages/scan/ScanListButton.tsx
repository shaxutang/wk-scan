import { UnorderedListOutlined } from '@ant-design/icons'
import { Button, Drawer } from 'antd'
import { useState } from 'react'
import ScanTable from './ScanTable'

const ScanListButton: React.FC = () => {
  const [open, setOpen] = useState(false)

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
        扫码列表
      </Button>
      <Drawer
        title="扫码列表"
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
