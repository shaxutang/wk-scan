import FloatButtons from '@/components/FloatButtons'
import Header from '@/components/Header'
import { ScanObject } from '@/types'
import { RCode } from '@/utils/R'
import { HomeOutlined, PlusOutlined } from '@ant-design/icons'
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
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import ScanObjectFormModal from './ObjectFormModal'

const NewModalButton: React.FC<{
  onOk: (scanObject: Omit<ScanObject, 'id'> & { id?: number }) => void
}> = ({ onOk }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { t } = useTranslation()

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
        {t('Add Scan Object')}
      </Button>
      <ScanObjectFormModal
        title={t('Add')}
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
  const { t } = useTranslation()

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
        {t('Edit')}
      </Button>
      <ScanObjectFormModal
        title={t('Edit')}
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
  const { t } = useTranslation()

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
    api.success(t('Update Success'))
  }

  const onSave = async (scanObject: Omit<ScanObject, 'id'>) => {
    const { code, message } = await window.electron.saveScanObject(scanObject)
    if (code !== RCode.SUCCESS) {
      api.error(message)
      return
    }
    loadScanObjects()
    api.success(t('Add Success'))
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
    api.success(t('Delete Success'))
  }

  const columns: TableProps<ScanObject>['columns'] = [
    {
      title: t('No.'),
      key: 'scanObjectValue',
      dataIndex: 'scanObjectValue',
      render: (text, scanObject, index) => index + 1,
    },
    {
      title: t('Scan Object Name'),
      dataIndex: 'scanObjectName',
      key: 'scanObjectName',
    },
    {
      title: t('Actions'),
      key: 'action',
      render: (_, scanObject) =>
        scanObject.scanObjectValue === 'common' ? null : (
          <Space>
            <EditModalButton initValue={scanObject} onOk={onUpdate} />
            <Popconfirm
              title={t('Confirm Delete?')}
              description={t('Scan Object Delete Description')}
              onConfirm={() => onDelete(scanObject)}
              okText={t('Confirm')}
              cancelText={t('Cancel')}
            >
              <Button type="primary" danger size="small">
                {t('Delete')}
              </Button>
            </Popconfirm>
          </Space>
        ),
    },
  ]

  return (
    <section className="flex h-screen flex-col">
      <Header
        breadcrumbs={[
          {
            title: (
              <Link to="/">
                <HomeOutlined className="mr-1" />
                <span>{t('Back to Home')}</span>
              </Link>
            ),
          },
        ]}
      />
      <div className="flex flex-col items-center justify-center gap-y-4 overflow-x-hidden pt-20">
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
          <Button type="primary">{t('Back to Home')}</Button>
        </Link>
      </div>
      {contextHolder}
      <FloatButtons />
    </section>
  )
}

export default ScanObjects
