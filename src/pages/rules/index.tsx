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
import { Link } from 'react-router-dom'
import ScanRuleFormModal from './ScanRuleFormModal'

const NewModalButton: React.FC<{
  onOk: (rule: Omit<ScanRule, 'id'>) => void
}> = ({ onOk }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const showModal = () => {
    setIsModalOpen(true)
  }

  const handleOk = (rule: Omit<ScanRule, 'id'>) => {
    onOk(rule)
    setIsModalOpen(false)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <Button icon={<PlusOutlined />} type="primary" onClick={showModal}>
        新增扫码规则
      </Button>
      <ScanRuleFormModal
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
  initValue: ScanRule
  onOk: (rule: ScanRule) => void
}> = ({ initValue, onOk }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const showModal = (e: React.MouseEvent) => {
    setIsModalOpen(true)
  }

  const handleOk = (rule: ScanRule) => {
    onOk(rule)
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
      <ScanRuleFormModal
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

const ScanRules: React.FC = () => {
  const [rules, setScanRules] = useState<ScanRule[]>([])
  const [api, contextHolder] = message.useMessage()

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
    api.success('新增成功')
  }

  const onUpdate = async (newScanRule: ScanRule) => {
    const { code, message } = await window.electron.saveScanRule(newScanRule)
    if (code !== RCode.SUCCESS) {
      api.error(message)
      return
    }
    loadScanRules()
    api.success('修改成功')
  }

  const onDelete = async (rule: ScanRule) => {
    const { code, message } = await window.electron.deleteScanRule(rule.id)
    if (code !== RCode.SUCCESS) {
      api.error(message)
      return
    }
    loadScanRules()
    api.success('删除成功')
  }

  const columns: TableProps<ScanRule>['columns'] = [
    {
      title: '序号',
      key: 'scanRuleValue',
      dataIndex: 'scanRuleValue',
      render: (text, product, index) => index + 1,
    },
    {
      title: '扫码规则名称',
      dataIndex: 'scanRuleName',
      key: 'scanRuleName',
    },
    {
      title: '扫码规则',
      dataIndex: 'scanRuleValue',
      key: 'scanRuleValue',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, rule) => (
        <Space>
          <EditModalButton initValue={rule} onOk={onUpdate} />
          <Popconfirm
            title="确定要删除吗？"
            description="删除后数据会保留，但不会再显示在列表中"
            onConfirm={() => onDelete(rule)}
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
        <Table columns={columns} dataSource={rules} rowKey="scanRuleValue" />
      </Card>
      <Link to="/">
        <Button type="primary">返回主页</Button>
      </Link>
      {contextHolder}
      <FloatButtons />
    </section>
  )
}

export default ScanRules
