import { ScanObject } from '@/types'
import { Form, Input, Modal, ModalProps, Radio } from 'antd'
import pinyin from 'pinyin'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ruleTypes } from './rules'

export interface ScanObjectFormModalProps extends Omit<ModalProps, 'onOk'> {
  initValue?: ScanObject
  onOk?: (product: Omit<ScanObject, 'id'> & { id?: number }) => void
}

const ScanObjectFormModal: React.FC<ScanObjectFormModalProps> = ({
  initValue,
  onOk,
  onCancel,
  ...rest
}: ScanObjectFormModalProps) => {
  const [form] = Form.useForm<ScanObject>()
  const materialNumber = Form.useWatch('materialNumber', form)
  const { t } = useTranslation()
  const [ruleType, setRuleType] = useState(ruleTypes.default.value)

  useEffect(() => {
    if (initValue) {
      form.setFieldsValue(initValue)
    }
  }, [initValue])

  useEffect(() => {
    if (ruleType === ruleTypes.materialNumber.value && !!materialNumber) {
      form.setFieldsValue({
        scanRule: `^${materialNumber}W\\d{10}$`,
      })
    }
  }, [materialNumber, ruleType])

  const handleOk = () => {
    form
      .validateFields()
      .then(() => {
        const values = form.getFieldsValue()

        const scanObject: Omit<ScanObject, 'id'> & { id?: number } = {
          ...values,
          id: initValue?.id,
          scanObjectValue: pinyin(values.scanObjectName, {
            style: pinyin.STYLE_INITIALS,
            heteronym: true,
          })
            .reduce((s1, s2) => [...s1, ...s2])
            .join('_'),
        }
        onOk?.(scanObject)
        form.resetFields()
      })
      .catch(() => {})
  }

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    onCancel?.(e)
  }

  const handleRuleTypeChange = (e: any) => {
    const value = e.target.value
    setRuleType(value)

    if (value === ruleTypes.default.value) {
      form.setFieldsValue({ scanRule: '.*' })
    } else if (value === ruleTypes.materialNumber.value) {
      form.setFieldsValue({
        scanRule: `^${form.getFieldValue('materialNumber')}W\\d{10}$`,
      })
    } else {
      form.setFieldsValue({
        scanRule: '',
      })
    }
  }

  return (
    <Modal {...rest} onOk={handleOk} onCancel={handleCancel}>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          materialNumber: '',
          scanRuleType: ruleTypes.default.value,
          scanRule: '.*',
        }}
      >
        <Form.Item
          name="scanObjectName"
          label={t('Scan Object Name')}
          rules={[
            { required: true, message: t('Please enter scan object name') },
          ]}
        >
          <Input placeholder={t('Please enter scan object name')} />
        </Form.Item>
        <Form.Item
          name="materialNumber"
          label={t('Material Number')}
          rules={[
            { required: true, message: t('Please enter material number') },
          ]}
        >
          <Input placeholder={t('Please enter material number')} />
        </Form.Item>
        <Form.Item name="scanRuleType" label={t('Scan Rule Type')}>
          <Radio.Group buttonStyle="solid" onChange={handleRuleTypeChange}>
            {Object.values(ruleTypes).map((ruleTypeValue) => (
              <Radio.Button
                key={ruleTypeValue.value}
                value={ruleTypeValue.value}
              >
                {t(ruleTypeValue.value)}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Form.Item>
        <Form.Item name="scanRule" label={t('Scan Rule Value')}>
          <Input
            readOnly={[
              ruleTypes.default.value,
              ruleTypes.materialNumber.value,
            ].includes(ruleType)}
            placeholder={t('Please enter scan rule')}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ScanObjectFormModal
