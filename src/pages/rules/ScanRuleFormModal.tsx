import { ScanRule } from '@/types'
import { Form, Input, Modal, ModalProps, Switch } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export interface ScanRuleFormModalProps extends Omit<ModalProps, 'onOk'> {
  initValue?: Omit<ScanRule, 'id'> & { id?: number }
  onOk?: (rule: ScanRule) => void
}

const ScanRuleFormModal: React.FC<ScanRuleFormModalProps> = ({
  initValue,
  onOk,
  onCancel,
  ...rest
}: ScanRuleFormModalProps) => {
  const [form] = Form.useForm<ScanRule>()
  const { t } = useTranslation()

  useEffect(() => {
    initValue && form.setFieldsValue(initValue)
  }, [initValue])

  const handleOk = () => {
    form
      .validateFields()
      .then(() => {
        const rule = form.getFieldsValue()
        onOk?.({
          ...rule,
          isDefault: !!rule.isDefault,
          id: initValue?.id,
        })
        form.resetFields()
      })
      .catch(() => {})
  }

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    onCancel?.(e)
  }

  return (
    <Modal {...rest} onOk={handleOk} onCancel={handleCancel}>
      <Form form={form} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
        <Form.Item
          name="scanRuleName"
          label={t('Scan Rule Name')}
          rules={[
            { required: true, message: t('Please enter scan rule name') },
          ]}
        >
          <Input placeholder={t('Please enter scan rule name')} />
        </Form.Item>
        <Form.Item
          name="scanRuleValue"
          label={t('Scan Rule')}
          rules={[{ required: true, message: t('Please enter scan rule') }]}
        >
          <Input placeholder={t('Please enter scan rule')} />
        </Form.Item>
        <Form.Item
          name="isDefault"
          label={t('Default')}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ScanRuleFormModal
