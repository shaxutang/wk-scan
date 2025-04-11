import Header from '@/components/Header'
import { WkrcType } from '@/main/wkrc'
import { RCode } from '@/utils/R'
import { FolderOpenOutlined, HomeOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, message, Radio, Space, Switch } from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'

const Settings = () => {
  const { t, i18n } = useTranslation()
  const [form] = Form.useForm<WkrcType>()
  const [messageApi, holder] = message.useMessage()
  const navigate = useNavigate()
  const [internet, setInternet] = useState(false)

  useEffect(() => {
    loadWkrc()
  }, [])

  const loadWkrc = async () => {
    const res = await window.electron.getWkrc()
    if (res.code === RCode.SUCCESS) {
      form.setFieldsValue(res.data)
      setInternet(res.data.internet)
    }
  }

  const onSubmit = async (values: WkrcType) => {
    const res = await window.electron.saveWkrc(values)
    if (res.code === RCode.SUCCESS) {
      messageApi.success(t('Save Success'))
      i18n.changeLanguage(values.language)
      loadWkrc()
    } else {
      messageApi.error(res.message)
    }
  }

  const selectFolder = async () => {
    const res = await window.electron.selectFolder()
    if (res.code === RCode.SUCCESS) {
      form.setFieldsValue({ workDir: res.data })
    } else {
      messageApi.warning(res.message)
    }
  }

  return (
    <section className="h-screen">
      <Header
        breadcrumbs={[
          {
            title: (
              <Link to="/">
                <HomeOutlined className="mr-1" />
                <span>{t('Back to Home')}</span>
              </Link>
            ),
          },
        ]}
      />
      <div className="pt-20">
        <Card title={t('Settings')} className="mx-auto w-1/2">
          <Form<WkrcType>
            form={form}
            initialValues={{ internet: false }}
            onFinish={onSubmit}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
          >
            <Form.Item
              label={t('Work Directory')}
              name="workDir"
              rules={[
                {
                  required: true,
                  message: t('Work directory cannot be empty'),
                },
              ]}
            >
              <Input
                suffix={
                  <FolderOpenOutlined
                    className="cursor-pointer"
                    onClick={selectFolder}
                  />
                }
              />
            </Form.Item>
            <Form.Item
              label={t('Language')}
              name="language"
              initialValue={i18n.language}
            >
              <Radio.Group optionType="button">
                <Radio value="zh">简体中文</Radio>
                <Radio value="en">English</Radio>
                <Radio value="jap">日本語</Radio>
                <Radio value="vi">Tiếng Việt</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label="启用联网模式"
              name="internet"
              valuePropName="checked"
            >
              <Switch onChange={(checked) => setInternet(checked)} />
            </Form.Item>
            {internet && (
              <>
                <Form.Item
                  label="host"
                  name="host"
                  rules={internet ? [{ required: true }] : []}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="port"
                  name="port"
                  wrapperCol={{ span: 3 }}
                  rules={internet ? [{ required: true }] : []}
                >
                  <Input />
                </Form.Item>
              </>
            )}
            <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
              <Space>
                <Button type="primary" htmlType="submit">
                  {t('Save')}
                </Button>
                <Button
                  onClick={() => {
                    navigate('/')
                  }}
                >
                  {t('Back to Home')}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>

      {holder}
    </section>
  )
}

export default Settings
