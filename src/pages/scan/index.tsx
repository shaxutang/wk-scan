import FloatButtons from '@/components/FloatButtons'
import { useScanStore } from '@/stores/useScanStore'
import { ScanDataType, Snapshot } from '@/types'
import dayjs from '@/utils/dayjs'
import { RCode } from '@/utils/R'
import { say } from '@/utils/video'
import { Modal, notification, Result } from 'antd'
import { throttle } from 'lodash'
import { useEffect, useRef, useState } from 'react'
import Chart from './Chart'
import Header from './Header'
import HistoryDawerButton from './HistoryDawerButton'
import ScanForm from './ScanForm'
import Statistics from './Statistics'

const throttleSay = throttle(say, 1000)

function generateData(count: number): ScanDataType[] {
  const data: ScanDataType[] = []

  for (let i = 0; i < count; i++) {
    const prefix = String(Math.floor(1000000 + Math.random() * 9000000)) // 7位数字
    const suffix = String(Math.floor(1000000000 + Math.random() * 9000000000)) // 10位数字
    const qrcode = `${prefix}W${suffix}`

    data.push({
      scanObjectName: `Product ${i + 1}`,
      scanObjectValue: `qì_yā_fá`,
      qrcode,
      date: Date.now(),
      id: i + 1,
    })
  }

  return data
}

const Page: React.FC = () => {
  const [snapshot, setSnapshot] = useState<Snapshot>({
    charData: [],
    lastHourCapacity: 0,
    totalCapacity: 0,
    speed: 0,
    growth: 0,
  })
  const scanStore = useScanStore()
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorQrCode, setErrorQrCode] = useState('')
  const [notificationApi, notificationHolder] = notification.useNotification()
  const timer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadSnapshot()
  }, [scanStore.scanStoreData])

  const loadSnapshot = async () => {
    const result = await window.electron.getSnapshot({
      scanDate: dayjs(scanStore.scanStoreData.scanDate).format('YYYY-MM-DD'),
      scanObject: scanStore.scanStoreData.scanObject,
    })

    if (result.code === RCode.SUCCESS) {
      setSnapshot(result.data)
    }
  }

  const onSubmit = async (data: ScanDataType) => {
    if (dayjs().isAfter(dayjs(scanStore.scanStoreData.scanDate), 'D')) {
      scanStore.setScanStoreData({
        ...scanStore.scanStoreData,
        scanDate: dayjs().toDate().getTime(),
      })
    }

    if (scanStore.scanStoreData.scanRule) {
      const regexp = new RegExp(scanStore.scanStoreData.scanRule)

      showErrorModal && setShowErrorModal(false)

      if (!regexp.test(data.qrcode)) {
        throttleSay(
          '扫码异常，请确认输入法是否是英文或当前扫描条码格式是否有误',
        )
        setErrorQrCode(data.qrcode)
        setShowErrorModal(true)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => {
          setShowErrorModal(false)
        }, 10000)
        return
      }
    }

    const { code, message } = await window.electron.saveScanData({
      scanObject: scanStore.scanStoreData.scanObject,
      scanDate: dayjs().format('YYYY-MM-DD'),
      data,
    })

    if (code === RCode.SUCCESS) {
      await loadSnapshot()
    } else if (code === RCode.DUPLICATE) {
      notificationApi.info({
        key: 'duplicate',
        message: '友情提示',
        description: '当前扫描的条码重复!',
        placement: 'top',
      })
    } else {
      notificationApi.error({
        key: 'error',
        message,
        description: '保存失败!',
        placement: 'top',
      })
    }
  }

  return (
    <section className="flex h-screen flex-col pb-8">
      <div>
        <Header />
        <div className="mt-8 flex items-center px-3">
          <div className="flex-auto">
            <ScanForm onSubmit={onSubmit} />
          </div>
          <HistoryDawerButton />
        </div>
        <div className="mt-8 px-3">
          <Statistics
            lastHourCapacity={snapshot?.lastHourCapacity ?? 0}
            totalCapacity={snapshot?.totalCapacity ?? 0}
            speed={snapshot?.speed ?? 0}
            growth={snapshot?.growth ?? 0}
          />
        </div>
      </div>
      <div className="mt-8 flex-auto px-3">
        <Chart snapshot={snapshot} className="h-full" />
      </div>
      <Modal
        title="错误提示"
        open={showErrorModal}
        width="80vw"
        styles={{
          body: {
            height: '60vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 36,
          },
        }}
        footer={null}
        maskClosable
        onCancel={() => setShowErrorModal(false)}
      >
        <Result
          status="error"
          title={<h2 className="mb-4 text-4xl">条码格式错误，请重新扫码</h2>}
          subTitle={
            <p className="text-2xl">
              请确认输入法是否是英文或当前扫描条码格式是否有误！
            </p>
          }
        >
          <div className="text-center text-xl">
            错误条码：
            <span className="text-red-500 underline">{errorQrCode}</span>
          </div>
        </Result>
      </Modal>
      <FloatButtons />
      {notificationHolder}
    </section>
  )
}

export default Page
