import FloatButtons from '@/components/FloatButtons'
import { ScanRule } from '@/types'
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
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import ScanRuleFormModal from './ScanRuleFormModal'

const NewModalButton: React.FC<{
  onOk: (rule: Omit<ScanRule, 'id'>) => void
}> = ({ onOk }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <>
      <Button
        icon={<PlusOutlined />}
        type="primary"
        onClick={() => setIsModalOpen(true)}
      >
        {t('Add Scan Rule')}
      </Button>
      <ScanRuleFormModal
        title={t('Add')}
        forceRender
        destroyOnClose
        open={isModalOpen}
        onOk={(rule) => {
          onOk(rule)
          setIsModalOpen(false)
        }}
        onCancel={() => setIsModalOpen(false)}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

const EditModalButton: React.FC<{
  initValue: ScanRule
  onOk: (rule: ScanRule) => void
}> = ({ initValue, onOk }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <>
      <Button type="primary" size="small" onClick={() => setIsModalOpen(true)}>
        {t('Edit')}
      </Button>
      <ScanRuleFormModal
        title={t('Edit')}
        forceRender
        destroyOnClose
        initValue={initValue}
        open={isModalOpen}
        onOk={(rule) => {
          onOk(rule)
          setIsModalOpen(false)
        }}
        onCancel={() => setIsModalOpen(false)}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

const ScanRules: React.FC = () => {
  const [rules, setScanRules] = useState<ScanRule[]>([])
  const [api, contextHolder] = message.useMessage()
  const { t } = useTranslation()

  const loadScanRules = async () => {
    const { data: scanRules } = await window.electron.getScanRuleList()
    setScanRules(scanRules)
  }

  useEffect(() => {
    loadScanRules()
  }, [])

  const onSave = async (rule: Omit<ScanRule, 'id'>) => {
    const { code, message } = await window.electron.saveScanRule(rule)
    if (code !== RCode.SUCCESS) {
      api.error(message)
      return
    }
    loadScanRules()
    api.success(t('Add Success'))
  }

  const onUpdate = async (newScanRule: ScanRule) => {
    const { code, message } = await window.electron.saveScanRule(newScanRule)
    if (code !== RCode.SUCCESS) {
      api.error(message)
      return
    }
    loadScanRules()
    api.success(t('Update Success'))
  }

  const onDelete = async (rule: ScanRule) => {
    const { code, message } = await window.electron.deleteScanRule(rule.id)
    if (code !== RCode.SUCCESS) {
      api.error(message)
      return
    }
    loadScanRules()
    api.success(t('Delete Success'))
  }

  const columns: TableProps<ScanRule>['columns'] = [
    {
      title: t('No.'),
      key: 'scanRuleValue',
      dataIndex: 'scanRuleValue',
      render: (text, product, index) => index + 1,
    },
    {
      title: t('Scan Rule Name'),
      dataIndex: 'scanRuleName',
      key: 'scanRuleName',
    },
    {
      title: t('Scan Rule'),
      dataIndex: 'scanRuleValue',
      key: 'scanRuleValue',
    },
    {
      title: t('Actions'),
      key: 'action',
      render: (_, rule) => (
        <Space>
          <EditModalButton initValue={rule} onOk={onUpdate} />
          <Popconfirm
            title={t('Confirm Delete?')}
            description={t('Scan Rule Delete Description')}
            onConfirm={() => onDelete(rule)}
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
    <section className="flex h-screen flex-col items-center justify-center gap-y-4 overflow-x-hidden">
      <Card className="w-[50vw]">
        <div className="mb-4">
          <NewModalButton onOk={onSave} />
        </div>
        <Table columns={columns} dataSource={rules} rowKey="scanRuleValue" />
      </Card>
      <Link to="/">
        <Button type="primary">{t('Back to Home')}</Button>
      </Link>
      {contextHolder}
      <FloatButtons />
    </section>
  )
}

export default ScanRules
