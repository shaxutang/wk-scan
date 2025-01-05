import FloatButtons from '@/components/FloatButtons'
import { useScanStore } from '@/stores/useScanStore'
import dayjs from '@/utils/dayjs'
import { AppstoreOutlined } from '@ant-design/icons'
import { Button, Divider, Form, message, Select } from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Link } from 'react-router-dom'
import { version } from '../../package.json'
import { ScanObject, ScanRule } from '../types'

const Page: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [scanObjects, setScanObjects] = useState<ScanObject[]>([])
  const [scanRules, setScanRules] = useState<ScanRule[]>([])
  // const [newScanObjectName, setNewScanObjectName] = useState<string>('')
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

  // const addItem = async (
  //   e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  // ) => {
  //   e.preventDefault()
  //   if (!newScanObjectName) {
  //     api.warning(t('Scan object name cannot be empty'))
  //     return
  //   }
  //   const scanObject: Omit<ScanObject, 'id'> = {
  //     scanObjectName: newScanObjectName,
  //     scanObjectValue: pinyin(newScanObjectName)
  //       .reduce((s1, s2) => [...s1, ...s2])
  //       .join('_'),
  //   }
  //   const { saveScanObject, getScanObjectList } = window.electron
  //   const { code, message } = await saveScanObject(scanObject)
  //   if (code !== RCode.SUCCESS) {
  //     api.error(message)
  //     return
  //   }
  //   const { data: newScanObjects } = await getScanObjectList()
  //   setScanObjects(newScanObjects)
  //   setNewScanObjectName('')
  //   api.success(t('Add Success'))
  // }

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
          label={t('Scan Object')}
          name="scanObjectValue"
          rules={[{ required: true, message: t('Please select scan object') }]}
        >
          <Select
            autoFocus
            defaultOpen
            allowClear
            showSearch
            placeholder={t('Please select scan object')}
            options={scanObjects.map(({ scanObjectName, scanObjectValue }) => ({
              label: scanObjectName,
              value: scanObjectValue,
            }))}
            size="large"
            dropdownRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: '8px 0' }} />
                <Link to="/objects">
                  <Button block icon={<AppstoreOutlined />}>
                    {t('Manage Scan Objects')}
                  </Button>
                </Link>
              </>
            )}
          />
        </Form.Item>
        <Form.Item
          label={t('Scan Rule')}
          name="scanRuleValue"
          rules={[{ required: true, message: t('Please select scan rule') }]}
        >
          <Select
            allowClear
            placeholder={t('Please select scan rule')}
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
                    {t('Manage Scan Rules')}
                  </Button>
                </Link>
              </>
            )}
          />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" type="primary">
            {t('Next')}
          </Button>
        </Form.Item>
      </Form>
      <div className="footer mt-12 text-center">
        <div className="mb-2 text-sm text-black/40 dark:text-white/40">
          {t('Version')}: {version}
        </div>
        <div className="text-sm text-black/40 dark:text-white/40">
          {t('Copyright')}
        </div>
      </div>
      {contextHolder}
      <FloatButtons />
    </section>
  )
}

export default Page
