import FloatButtons from '@/components/FloatButtons'
import { useScanStore } from '@/stores/useScanStore'
import dayjs from '@/utils/dayjs'
import { RCode } from '@/utils/R'
import { AppstoreOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Divider, Form, Input, message, Select, Space } from 'antd'
import pinyin from 'pinyin'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Link } from 'react-router-dom'
import { version } from '../../package.json'
import { ScanObject, ScanRule } from '../types'

const Page: React.FC = () => {
  const navigate = useNavigate()
  const [scanObjects, setScanObjects] = useState<ScanObject[]>([])
  const [scanRules, setScanRules] = useState<ScanRule[]>([])
  const [newScanObjectName, setNewScanObjectName] = useState<string>('')
  const [api, contextHolder] = message.useMessage()
  const [form] = Form.useForm()
  const scanStore = useScanStore()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { getScanObjectList, getScanRuleList } = window.electron
    const { data: scanObjects } = await getScanObjectList()
    const { data: scanRules } = await getScanRuleList()
    setScanObjects(scanObjects)
    setScanRules(scanRules)

    if (scanRules.length) {
      const rule = scanRules.find((rule) => rule.isDefault)
      form.setFieldValue(
        'scanRuleValue',
        rule?.scanRuleValue ?? scanRules[0].scanRuleValue,
      )
    }
  }

  const addItem = async (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) => {
    e.preventDefault()
    if (!newScanObjectName) {
      api.warning('扫码对象名称不能为空')
      return
    }
    const scanObject: Omit<ScanObject, 'id'> = {
      scanObjectName: newScanObjectName,
      scanObjectValue: pinyin(newScanObjectName)
        .reduce((s1, s2) => [...s1, ...s2])
        .join('_'),
    }
    const { saveScanObject, getScanObjectList } = window.electron
    const { code, message } = await saveScanObject(scanObject)
    if (code !== RCode.SUCCESS) {
      api.error(message)
      return
    }
    const { data: newScanObjects } = await getScanObjectList()
    setScanObjects(newScanObjects)
    setNewScanObjectName('')
    api.success('新增成功')
  }

  const onFinish = ({
    scanObjectValue,
    scanRuleValue,
  }: {
    scanObjectValue: string
    scanRuleValue: string
  }) => {
    const scanObject = scanObjects.find(
      (scanObject) => scanObject.scanObjectValue === scanObjectValue,
    )
    const scanRule = scanRules.find(
      (scanRule) => scanRule.scanRuleValue === scanRuleValue,
    )
    scanStore.setScanStoreData({
      scanObject,
      scanRule: scanRule.scanRuleValue,
      scanDate: dayjs().toDate().getTime(),
    })
    navigate('/scan')
  }

  return (
    <section className="flex h-screen flex-col items-center justify-center gap-y-12">
      <Form<{
        scanObjectValue: string
      }>
        form={form}
        layout="vertical"
        className="w-[420px]"
        onFinish={onFinish}
      >
        <Form.Item
          label="扫码对象"
          name="scanObjectValue"
          rules={[{ required: true, message: '请选择扫码对象' }]}
        >
          <Select
            autoFocus
            defaultOpen
            allowClear
            showSearch
            placeholder="请选择扫码对象"
            options={scanObjects.map(({ scanObjectName, scanObjectValue }) => ({
              label: scanObjectName,
              value: scanObjectValue,
            }))}
            size="large"
            dropdownRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: '8px 0' }} />
                <Space style={{ padding: '0 8px 4px' }}>
                  <Input
                    placeholder="请输入扫码对象名称"
                    onKeyDown={(e) => e.stopPropagation()}
                    value={newScanObjectName}
                    onChange={(e) => setNewScanObjectName(e.target.value)}
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={addItem}
                  >
                    新增
                  </Button>
                  <Link to="/objects">
                    <Button icon={<AppstoreOutlined />}>管理扫码对象</Button>
                  </Link>
                </Space>
              </>
            )}
          />
        </Form.Item>
        <Form.Item
          label="扫码规则"
          name="scanRuleValue"
          rules={[{ required: true, message: '请选择扫码规则' }]}
        >
          <Select
            allowClear
            placeholder="请选择扫码规则"
            options={scanRules.map(({ scanRuleName, scanRuleValue }) => ({
              label: scanRuleName,
              value: scanRuleValue,
            }))}
            size="large"
            dropdownRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: '8px 0' }} />
                <Link to="/rules">
                  <Button block icon={<AppstoreOutlined />}>
                    管理扫码规则
                  </Button>
                </Link>
              </>
            )}
          />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" type="primary">
            下一步
          </Button>
        </Form.Item>
      </Form>
      <div className="footer mt-12 text-center">
        <div className="mb-2 text-sm text-black/40 dark:text-white/40">
          Version: {version}
        </div>
        <div className="text-sm text-black/40 dark:text-white/40">
          Copyright © 2024 YangJingYu IE Team. All rights reserved.
        </div>
      </div>
      {contextHolder}
      <FloatButtons />
    </section>
  )
}

export default Page
