import dayjs from '@/utils/dayjs'
import { ClockCircleOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'

const Clock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(dayjs().format('HH:mm:ss'))

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format('HH:mm:ss'))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex h-8 items-center rounded-lg px-3 font-mono text-lg font-bold text-gray-700 dark:text-gray-300">
      <ClockCircleOutlined className="mr-2" />
      <span>{currentTime}</span>
    </div>
  )
}

export default Clock
