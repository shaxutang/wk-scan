import { ScanObject } from '@/types'
import { Form, Input, Modal, ModalProps } from 'antd'
import pinyin from 'pinyin'
import { useEffect } from 'react'

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

  useEffect(() => {
    initValue && form.setFieldsValue(initValue)
  }, [initValue])

  const handleOk = () => {
    form
      .validateFields()
      .then(() => {
        const values = form.getFieldsValue()
        const scanObject: Omit<ScanObject, 'id'> & { id?: number } = {
          ...values,
          id: initValue?.id,
          scanObjectValue: pinyin(values.scanObjectName)
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

  return (
    <Modal {...rest} onOk={handleOk} onCancel={handleCancel}>
      <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Form.Item
          name="scanObjectName"
          label="扫码对象名称"
          rules={[{ required: true, message: '请输入扫码对象名称' }]}
        >
          <Input placeholder="请输入扫码对象名称" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ScanObjectFormModal
