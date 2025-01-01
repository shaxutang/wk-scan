import { Button, Input, Space } from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const QuickAction: React.FC<{
  value: string
  onSubmit: (value: string) => void
  onReset: () => void
}> = ({ value, onSubmit, onReset }) => {
  const [innerValue, setInnerValue] = useState(value ?? '')
  const { t } = useTranslation()

  useEffect(() => {
    setInnerValue(value)
  }, [value])

  // 按回车提交
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSubmit(innerValue)
    }
  }

  return (
    <Space>
      <Input
        value={innerValue}
        onChange={(e) => setInnerValue(e.target.value)}
        placeholder={t('Please enter barcode')}
        className="w-72"
        onKeyDown={handleKeyDown}
      />
      <Button type="primary" onClick={() => onSubmit(innerValue)}>
        {t('Quick Search')}
      </Button>
      <Button onClick={onReset}>{t('Reset')}</Button>
    </Space>
  )
}

export default QuickAction
