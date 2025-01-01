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

type FormInstance = Pick<ScanDataType, 'qrcode'> & { autoFocus?: boolean }

const ScanForm: React.FC<{
  onSubmit?: (data: ScanDataType) => void
}> = ({ onSubmit }) => {
  const { t } = useTranslation()
  const [api, contextHolder] = notification.useNotification()
  const [form] = Form.useForm<FormInstance>()
  const inputRef = useRef<InputRef>(null!)
  const scanStore = useScanStore()

  useEffect(() => {
    if (
      form.getFieldValue('autoFocus') &&
      dayjs().isSame(
        dayjs(scanStore.scanStoreData.scanDate).format('YYYY-MM-DD'),
        'D',
      )
    ) {
      inputRef.current.focus()
    }
  }, [scanStore.scanStoreData.scanDate])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit({
        date: dayjs().toDate().getTime(),
        qrcode: (e.currentTarget as HTMLInputElement).value,
        ...scanStore.scanStoreData.scanObject,
      })
      form.resetFields(['qrcode'])
    }
  }

  const onBlur = () => {
    if (form.getFieldValue('autoFocus')) {
      inputRef.current.focus()
      api.warning({
        key: 1,
        message: t('Operation Tips'),
        description: (
          <>
            {t('Auto Focus Notice')}
            <button className="text-primary" onClick={onCancelAutoFocus}>
              {t('Disable Auto Focus')}
            </button>
          </>
        ),
        placement: 'top',
        showProgress: true,
        pauseOnHover: true,
      })
    }
  }

  const onCancelAutoFocus = () => {
    form.setFieldValue('autoFocus', false)
    api.success({
      key: 1,
      message: t('Auto Focus Disabled'),
      description: (
        <>
          {t('Manual Focus Notice')}
          <button
            className="text-primary"
            onClick={() => inputRef.current.focus()}
          >
            {t('Focus Text Box')}
          </button>
        </>
      ),
      placement: 'top',
      showProgress: true,
      pauseOnHover: true,
    })
  }

  const onChecked = (checked: boolean) => {
    if (checked) {
      inputRef.current.focus()
    } else {
      api.destroy()
    }
  }

  return (
    <>
      <Form<{
        qrcode: string
      }>
        form={form}
        initialValues={{
          qrcode: '',
          autoFocus: true,
        }}
        disabled={!dayjs().isSame(dayjs(scanStore.scanStoreData.scanDate), 'D')}
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
                onKeyDown={(e) => onKeyDown(e)}
                onBlur={onBlur}
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
              <Switch defaultChecked onChange={onChecked} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      {contextHolder}
    </>
  )
}

export default ScanForm
