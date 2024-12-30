import { ScanRule } from '@/types'
import { Form, Input, Modal, ModalProps, Switch } from 'antd'
import { useEffect } from 'react'

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
      <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Form.Item
          name="scanRuleName"
          label="条码规则名称"
          rules={[{ required: true, message: '请输入条码规则名称' }]}
        >
          <Input placeholder="请输入条码规则名称" />
        </Form.Item>
        <Form.Item
          name="scanRuleValue"
          label="条码规则"
          rules={[{ required: true, message: '请输入条码规则' }]}
        >
          <Input placeholder="请输入条码规则" />
        </Form.Item>
        <Form.Item name="isDefault" label="默认" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ScanRuleFormModal
