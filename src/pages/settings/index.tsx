import { WkrcType } from '@/main/wkrc'
import { RCode } from '@/utils/R'
import { Button, Card, Form, Input, message, Space } from 'antd'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Settings = () => {
  const [form] = Form.useForm<WkrcType>()
  const [messageApi, holder] = message.useMessage()
  const navigate = useNavigate()

  const loadWkrc = async () => {
    const res = await window.electron.getWkrc()
    if (res.code === RCode.SUCCESS) {
      form.setFieldsValue(res.data)
    }
  }

  useEffect(() => {
    loadWkrc()
  }, [])

  const onSubmit = async (values: WkrcType) => {
    const res = await window.electron.saveWkrc(values)
    if (res.code === RCode.SUCCESS) {
      messageApi.success('保存成功')
      loadWkrc()
    } else {
      messageApi.error(res.message)
    }
  }

  return (
    <section className="flex h-screen items-center justify-center">
      <Card title="设置" className="w-1/2">
        <Form<WkrcType> form={form} onFinish={onSubmit}>
          <Form.Item
            label="工作目录"
            name="workDir"
            rules={[{ required: true, message: '工作目录不能为空' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button
                onClick={() => {
                  navigate('/')
                }}
              >
                返回首页
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
      {holder}
    </section>
  )
}

export default Settings
