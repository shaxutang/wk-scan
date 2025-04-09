import FloatButtons from '@/components/FloatButtons'
import { useScanStore } from '@/stores/useScanStore'
import { ScanDataType, Snapshot } from '@/types'
import dayjs from '@/utils/dayjs'
import { RCode } from '@/utils/R'
import { say } from '@/utils/video'
import { RollbackOutlined } from '@ant-design/icons/lib'
import { Button, Modal, notification, Result, Space } from 'antd'
import { throttle } from 'lodash'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ruleTypes } from '../objects/rules'
import Chart from './Chart'
import Header from './Header'
import HistoryDawerButton from './HistoryDawerButton'
import ScanForm from './ScanForm'
import Statistics from './Statistics'

const throttleSay = throttle(say, 1000)

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
  const [errorContent, seterrorContent] = useState('')
  const [notificationApi, notificationHolder] = notification.useNotification()
  const timer = useRef<NodeJS.Timeout | null>(null)
  const { t, i18n } = useTranslation()

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

  const scanRuleTypeHandle = {
    [ruleTypes.materialNumber.value]: (qrcode: string) => {
      const match = qrcode.match(/W(\d{6})/)
      if (match) {
        const YYMMdd = match[1]
        const day = dayjs(YYMMdd, 'YYMMDD')
        if (!day.isValid() || !dayjs().isSame(day, 'D')) {
          setShowErrorModal(true)
          seterrorContent(
            `${qrcode} ${t('The barcode date format is incorrect')}`,
          )
          throttleSay(t('The barcode date format is incorrect'), i18n.language)
          clearTimeout(timer.current)
          timer.current = setTimeout(() => {
            setShowErrorModal(false)
          }, 10000)
          return false
        }
      }
      return true
    },
  }

  const onSubmit = async (data: ScanDataType) => {
    if (dayjs().isAfter(dayjs(scanStore.scanStoreData.scanDate), 'D')) {
      scanStore.setScanStoreData({
        ...scanStore.scanStoreData,
        scanDate: dayjs().toDate().getTime(),
      })
    }

    const scanRule = scanStore.scanStoreData.scanObject.scanRule
    if (scanRule) {
      const regexp = new RegExp(scanRule)

      showErrorModal && setShowErrorModal(false)

      if (!regexp.test(data.qrcode)) {
        throttleSay(t('The barcode format is incorrect'), i18n.language)
        seterrorContent(
          `${data.qrcode} ${t('The barcode format is incorrect')}`,
        )
        setShowErrorModal(true)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => {
          setShowErrorModal(false)
        }, 10000)
        return
      }
    }

    const scanRuleType = scanStore.scanStoreData.scanObject.scanRuleType

    const alloeContinue =
      scanRuleTypeHandle[scanRuleType]?.(data.qrcode) ?? true

    if (!alloeContinue) return

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
        message: t('Friendly Reminder'),
        description: t('Duplicate Barcode'),
        placement: 'top',
      })
    } else {
      notificationApi.error({
        key: 'error',
        message: message,
        description: t('Save Failed'),
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
          <Space>
            {!dayjs().isSame(dayjs(scanStore.scanStoreData.scanDate), 'D') && (
              <Button
                type="primary"
                icon={<RollbackOutlined />}
                onClick={() =>
                  scanStore.setScanStoreData({
                    ...scanStore.scanStoreData,
                    scanDate: dayjs().toDate().getTime(),
                  })
                }
              >
                {t('Back to Today')}
              </Button>
            )}
            <HistoryDawerButton />
          </Space>
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
        title={t('Error Tip')}
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
          title={<h2 className="mb-4 text-4xl">{t('Barcode Format Error')}</h2>}
          subTitle={<p className="text-2xl">{t('Input Method Check')}</p>}
        >
          <div className="text-center text-xl">
            {t('Error Content')}
            <span className="text-red-500">{errorContent}</span>
          </div>
        </Result>
      </Modal>
      <FloatButtons />
      {notificationHolder}
    </section>
  )
}

export default Page
