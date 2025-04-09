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
import { ScanObject } from '../types'

const Page: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [scanObjects, setScanObjects] = useState<ScanObject[]>([])
  const [api, contextHolder] = message.useMessage()
  const [form] = Form.useForm()
  const scanStore = useScanStore()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { getScanObjectList, getScanRuleList } = window.electron
    const { data: scanObjects } = await getScanObjectList()
    setScanObjects(scanObjects)
  }

  const onFinish = ({ scanObjectValue }: { scanObjectValue: string }) => {
    const scanObject = scanObjects.find(
      (scanObject) => scanObject.scanObjectValue === scanObjectValue,
    )
    scanStore.setScanStoreData({
      scanObject,
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
