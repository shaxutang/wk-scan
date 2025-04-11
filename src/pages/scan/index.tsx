import FloatButtons from '@/components/FloatButtons'
import Header from '@/components/Header'
import { useScanStore } from '@/stores/useScanStore'
import { ScanDataType, Snapshot } from '@/types'
import dayjs from '@/utils/dayjs'
import { RCode } from '@/utils/R'
import { say } from '@/utils/video'
import { HomeOutlined, RollbackOutlined } from '@ant-design/icons/lib'
import { Button, Modal, notification, Result, Space } from 'antd'
import { throttle } from 'lodash'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { ruleTypes } from '../objects/rules'
import Chart from './Chart'
import HistoryDawerButton from './HistoryDawerButton'
import ScanForm from './ScanForm'
import Statistics from './Statistics'

const throttleSay = throttle(say, 1000)

const useSnapshot = (scanDate: number, scanObject: any) => {
  const [snapshot, setSnapshot] = useState<Snapshot>({
    charData: [],
    lastHourCapacity: 0,
    totalCapacity: 0,
    speed: 0,
    growth: 0,
  })

  const loadSnapshot = useCallback(async () => {
    const result = await window.electron.getSnapshot({
      scanDate: dayjs(scanDate).format('YYYY-MM-DD'),
      scanObject,
    })

    if (result.code === RCode.SUCCESS) {
      setSnapshot(result.data)
    }
  }, [scanDate, scanObject])

  return { snapshot, loadSnapshot }
}

const Page: React.FC = () => {
  const scanStore = useScanStore()
  const { scanDate, scanObject } = scanStore.scanStoreData
  const { snapshot, loadSnapshot } = useSnapshot(scanDate, scanObject)

  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorContent, setErrorContent] = useState('')
  const [notificationApi, notificationHolder] = notification.useNotification()
  const timer = useRef<NodeJS.Timeout | null>(null)
  const { t, i18n } = useTranslation()

  useEffect(() => {
    loadSnapshot()
  }, [scanDate, scanObject, loadSnapshot])

  const handleScanRuleType = useCallback(
    (qrcode: string): boolean => {
      const match = qrcode.match(/W(\d{6})/)
      if (match) {
        const YYMMdd = match[1]
        const day = dayjs(YYMMdd, 'YYMMDD')
        if (!day.isValid() || !dayjs().isSame(day, 'D')) {
          const message = `${qrcode} ${t('The barcode date format is incorrect')}`
          setErrorContent(message)
          setShowErrorModal(true)
          throttleSay(t('The barcode date format is incorrect'), i18n.language)
          clearTimeout(timer.current!)
          timer.current = setTimeout(() => setShowErrorModal(false), 10000)
          return false
        }
      }
      return true
    },
    [t, i18n.language],
  )

  const onSubmit = useCallback(
    async (data: ScanDataType) => {
      if (dayjs().isAfter(dayjs(scanDate), 'D')) {
        scanStore.setScanStoreData({
          ...scanStore.scanStoreData,
          scanDate: dayjs().toDate().getTime(),
        })
      }

      const { scanRule, scanRuleType } = scanObject
      const regexp = scanRule ? new RegExp(scanRule) : null

      if (regexp && !regexp.test(data.qrcode)) {
        const message = `${data.qrcode} ${t('The barcode format is incorrect')}`
        setErrorContent(message)
        setShowErrorModal(true)
        throttleSay(t('The barcode format is incorrect'), i18n.language)
        clearTimeout(timer.current!)
        timer.current = setTimeout(() => setShowErrorModal(false), 10000)
        return
      }

      const isValid =
        ruleTypes.materialNumber.value === scanRuleType
          ? handleScanRuleType(data.qrcode)
          : true

      if (!isValid) return

      const { code, message } = await window.electron.saveScanData({
        scanObject,
        scanDate: dayjs().format('YYYY-MM-DD'),
        data,
      })

      if (code === RCode.SUCCESS) {
        await loadSnapshot()
      } else {
        notificationApi[code === RCode.DUPLICATE ? 'info' : 'error']({
          key: code === RCode.DUPLICATE ? 'duplicate' : 'error',
          message: code === RCode.DUPLICATE ? t('Friendly Reminder') : message,
          description:
            code === RCode.DUPLICATE
              ? t('Duplicate Barcode')
              : t('Save Failed'),
          placement: 'top',
        })
      }
    },
    [scanDate, scanObject, handleScanRuleType, t, i18n.language, loadSnapshot],
  )

  return (
    <section className="flex h-screen flex-col pb-8">
      <Header
        breadcrumbs={[
          {
            title: (
              <Link to="/">
                <HomeOutlined className="mr-1" />
                <span>{t('Select scan object')}</span>
              </Link>
            ),
          },
          {
            title: scanObject.scanObjectName,
          },
        ]}
      />

      <div className="mt-8 flex items-center px-3">
        <div className="flex-auto">
          <ScanForm onSubmit={onSubmit} />
        </div>
        <Space>
          {!dayjs().isSame(dayjs(scanDate), 'D') && (
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
        <Statistics {...snapshot} />
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
            {t('Error Content')}{' '}
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
