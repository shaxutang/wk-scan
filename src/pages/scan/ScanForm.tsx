import { useScanStore } from '@/stores/useScanStore'
import { ScanDataType } from '@/types'
import dayjs from '@/utils/dayjs'
import { QuestionCircleOutlined, ScanOutlined } from '@ant-design/icons'
import {
  Col,
  Form,
  Input,
  InputRef,
  notification,
  Row,
  Switch,
  Tooltip,
} from 'antd'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

interface FormValues {
  qrcode: string
  autoFocus: boolean
}

const ScanForm: React.FC<{
  onSubmit?: (data: ScanDataType) => void
}> = ({ onSubmit }) => {
  const { t } = useTranslation()
  const [api, contextHolder] = notification.useNotification()
  const [form] = Form.useForm<FormValues>()
  const inputRef = useRef<InputRef>(null!)
  const scanStore = useScanStore()

  const isSameDay = () => {
    return dayjs().isSame(
      dayjs(scanStore.scanStoreData.scanDate).format('YYYY-MM-DD'),
      'D',
    )
  }

  const focusInput = () => {
    inputRef.current.focus()
  }

  const showAutoFocusWarning = () => {
    api.warning({
      key: 'auto-focus',
      message: t('Operation Tips'),
      description: (
        <>
          {t('Auto Focus Notice')}
          <button className="text-primary" onClick={handleDisableAutoFocus}>
            {t('Disable Auto Focus')}
          </button>
        </>
      ),
      placement: 'top',
      showProgress: true,
      pauseOnHover: true,
    })
  }

  const showManualFocusSuccess = () => {
    api.success({
      key: 'manual-focus',
      message: t('Auto Focus Disabled'),
      description: (
        <>
          {t('Manual Focus Notice')}
          <button className="text-primary" onClick={focusInput}>
            {t('Focus Text Box')}
          </button>
        </>
      ),
      placement: 'top',
      showProgress: true,
      pauseOnHover: true,
    })
  }

  useEffect(() => {
    if (form.getFieldValue('autoFocus') && isSameDay()) {
      focusInput()
    }
  }, [scanStore.scanStoreData.scanDate])

  const handleSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const { id, scanObjectName, scanObjectValue } =
        scanStore.scanStoreData.scanObject
      onSubmit?.({
        date: dayjs().toDate().getTime(),
        qrcode: (e.currentTarget as HTMLInputElement).value,
        id,
        scanObjectName,
        scanObjectValue,
      })
      form.resetFields(['qrcode'])
    }
  }

  const handleBlur = () => {
    if (form.getFieldValue('autoFocus')) {
      focusInput()
      showAutoFocusWarning()
    }
  }

  const handleDisableAutoFocus = () => {
    form.setFieldValue('autoFocus', false)
    showManualFocusSuccess()
  }

  const handleAutoFocusChange = (checked: boolean) => {
    if (checked) {
      focusInput()
    } else {
      api.destroy()
    }
  }

  return (
    <>
      <Form<FormValues>
        form={form}
        initialValues={{
          qrcode: '',
          autoFocus: true,
        }}
        disabled={!isSameDay()}
        className="[&_.ant-form-item]:!mb-0"
      >
        <Row gutter={[16, 16]} style={{ marginInline: 0 }}>
          <Col span={8}>
            <Form.Item label={t('Scan QR Code')} name="qrcode">
              <Input
                ref={inputRef}
                placeholder={t('Please scan QR code')}
                prefix={<ScanOutlined style={{ fontSize: 24 }} />}
                size="large"
                autoFocus
                onKeyDown={handleSubmit}
                onBlur={handleBlur}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={
                <span>
                  <span className="mr-2 text-sm">{t('Auto Focus')}</span>
                  <Tooltip
                    placement="topRight"
                    title={t('Auto Focus Tooltip')}
                    arrow
                  >
                    <QuestionCircleOutlined className="cursor-pointer" />
                  </Tooltip>
                </span>
              }
              name="autoFocus"
              valuePropName="checked"
            >
              <Switch defaultChecked onChange={handleAutoFocusChange} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      {contextHolder}
    </>
  )
}

export default ScanForm
