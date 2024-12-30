import FloatButtons from '@/components/FloatButtons'
import { ScanObject } from '@/types'
import { RCode } from '@/utils/R'
import { PlusOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  message,
  Popconfirm,
  Space,
  Table,
  TableProps,
} from 'antd'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ScanObjectFormModal from './ObjectFormModal'

const NewModalButton: React.FC<{
  onOk: (scanObject: Omit<ScanObject, 'id'> & { id?: number }) => void
}> = ({ onOk }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const showModal = (e: React.MouseEvent) => {
    setIsModalOpen(true)
  }

  const handleOk = (scanObject: Omit<ScanObject, 'id'> & { id?: number }) => {
    onOk(scanObject)
    setIsModalOpen(false)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
        新增扫码对象
      </Button>
      <ScanObjectFormModal
        title="新增"
        forceRender
        destroyOnClose
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

const EditModalButton: React.FC<{
  initValue: ScanObject
  onOk: (scanObject: Omit<ScanObject, 'id'> & { id?: number }) => void
}> = ({ initValue, onOk }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const showModal = (e: React.MouseEvent) => {
    setIsModalOpen(true)
  }

  const handleOk = (scanObject: Omit<ScanObject, 'id'> & { id?: number }) => {
    onOk?.(scanObject)
    setIsModalOpen(false)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <Button type="primary" size="small" onClick={showModal}>
        编辑
      </Button>
      <ScanObjectFormModal
        title="编辑"
        forceRender
        destroyOnClose
        initValue={initValue}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

const ScanObjects: React.FC = () => {
  const [scanObjects, setScanObjects] = useState<ScanObject[]>([])
  const [api, contextHolder] = message.useMessage()

  const loadScanObjects = async () => {
    const { getScanObjectList } = window.electron
    const { data: scanObjects } = await getScanObjectList()
    setScanObjects(scanObjects)
  }

  useEffect(() => {
    loadScanObjects()
  }, [])

  const onUpdate = async (newScanObject: ScanObject) => {
    const { code, message } =
      await window.electron.saveScanObject(newScanObject)
    if (code !== RCode.SUCCESS) {
      api.error(message)
      return
    }
    loadScanObjects()
    api.success('修改成功')
  }

  const onSave = async (scanObject: Omit<ScanObject, 'id'>) => {
    const { code, message } = await window.electron.saveScanObject(scanObject)
    if (code !== RCode.SUCCESS) {
      api.error(message)
      return
    }
    loadScanObjects()
    api.success('新增成功')
  }

  const onDelete = async (scanObject: ScanObject) => {
    const { code, message } = await window.electron.deleteScanObject(
      scanObject.id,
    )
    if (code !== RCode.SUCCESS) {
      api.error(message)
      return
    }
    loadScanObjects()
    api.success('删除成功')
  }

  const columns: TableProps<ScanObject>['columns'] = [
    {
      title: '序号',
      key: 'scanObjectValue',
      dataIndex: 'scanObjectValue',
      render: (text, scanObject, index) => index + 1,
    },
    {
      title: '扫码对象名称',
      dataIndex: 'scanObjectName',
      key: 'scanObjectName',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, scanObject) => (
        <Space>
          <EditModalButton initValue={scanObject} onOk={onUpdate} />
          <Popconfirm
            title="确定要删除吗？"
            description="删除后数据会保留，但不会再显示在列表中"
            onConfirm={() => onDelete(scanObject)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="primary" danger size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <section className="flex h-screen flex-col items-center justify-center gap-y-4 overflow-x-hidden">
      <Card className="w-[50vw]">
        <div className="mb-4">
          <NewModalButton onOk={onSave} />
        </div>
        <Table
          columns={columns}
          dataSource={scanObjects}
          rowKey="scanObjectValue"
        />
      </Card>
      <Link to="/">
        <Button type="primary">返回主页</Button>
      </Link>
      {contextHolder}
      <FloatButtons />
    </section>
  )
}

export default ScanObjects
