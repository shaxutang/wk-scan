import { useScanStore } from '@/stores/useScanStore'
import dayjs from '@/utils/dayjs'
import { RCode } from '@/utils/R'
import { ExportOutlined, HistoryOutlined } from '@ant-design/icons/lib'
import {
  Button,
  Checkbox,
  Collapse,
  Drawer,
  Empty,
  Flex,
  List,
  message,
  Space,
} from 'antd'
import { Dayjs } from 'dayjs'
import { useState, useTransition } from 'react'
import { useTranslation } from 'react-i18next'

const HistoryDawerButton: React.FC = () => {
  const [exportList, setExportList] = useState<
    {
      name: string
      date: Dayjs
    }[]
  >([])
  const [open, setOpen] = useState<boolean>(false)
  const [messageApi, holder] = message.useMessage()
  const [selectedDays, setSelectedDays] = useState<Dayjs[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isLoadDataPending, startLoadDataTransition] = useTransition()
  const scanStore = useScanStore()
  const { t, i18n } = useTranslation()

  const onClick = async () => {
    setOpen(true)
    startLoadDataTransition(() => {
      window.electron
        .getScanHistory(scanStore.scanStoreData.scanObject)
        .then((res) => {
          if (res.code === RCode.SUCCESS) {
            const list = res.data.map((item) => ({
              name: item.name,
              date: dayjs(item.date),
            }))
            const hasNow = list.some((item) =>
              dayjs(item.date).isSame(dayjs(), 'D'),
            )
            if (!hasNow) {
              list.push({
                name: dayjs().format('YYYY-MM-DD'),
                date: dayjs(),
              })
            }
            list.sort((a, b) => b.date.valueOf() - a.date.valueOf())
            setExportList(list)
          }
        })
    })
  }

  const onExport = async (date: Dayjs) => {
    setIsExporting(true)
    try {
      const { code, message } = await window.electron.exportScanData({
        scanObject: scanStore.scanStoreData.scanObject,
        scanDates: [date.format('YYYY-MM-DD')],
        language: i18n.language,
      })
      if (code === RCode.SUCCESS) {
        messageApi.success(t('Export Success'))
        window.electron.openExportExplorer(scanStore.scanStoreData.scanObject)
      } else {
        messageApi.error(message)
      }
    } finally {
      setIsExporting(false)
    }
  }

  const onBatchExport = async () => {
    setIsExporting(true)
    try {
      const res = await window.electron.exportScanData({
        scanObject: scanStore.scanStoreData.scanObject,
        scanDates: selectedDays.map((day) => day.format('YYYY-MM-DD')),
        language: i18n.language,
      })
      if (res.code === RCode.SUCCESS) {
        messageApi.success(t('Export Success'))
        window.electron.openExportExplorer(scanStore.scanStoreData.scanObject)
      } else {
        messageApi.error(res.message)
      }
    } finally {
      setIsExporting(false)
    }
  }

  const onView = (scanDate: Dayjs) => {
    scanStore.setScanStoreData({
      ...scanStore.scanStoreData,
      scanDate: scanDate.toDate().getTime(),
    })
    setOpen(false)
  }

  const onSelectAllChange = (checked: boolean) => {
    if (checked) {
      setSelectedDays(exportList.map((item) => item.date))
    } else {
      setSelectedDays([])
    }
    setSelectAll(checked)
  }

  // Group data by month
  const groupedData = exportList.reduce(
    (acc, item) => {
      const yearMonth = item.date.format('YYYY-MM')
      if (!acc[yearMonth]) {
        acc[yearMonth] = []
      }
      acc[yearMonth].push(item)
      return acc
    },
    {} as Record<string, typeof exportList>,
  )

  // Sort months in descending order
  const months = Object.keys(groupedData).sort((a, b) => {
    return dayjs(b).valueOf() - dayjs(a).valueOf()
  })

  const collapseItems = months.map((month) => ({
    key: month,
    label: dayjs(month).format('YYYY - MM'),
    children: (
      <List className="space-y-4">
        {groupedData[month].map((item) => (
          <List.Item
            key={item.date.valueOf()}
            className="flex items-center text-xl"
          >
            <label className="flex cursor-pointer items-center text-lg">
              <Checkbox
                checked={selectedDays.some((day) => day.isSame(item.date, 'D'))}
                onClick={() =>
                  setSelectedDays((prev) => {
                    const exists = prev.some((day) =>
                      day.isSame(item.date, 'D'),
                    )
                    if (exists) {
                      return prev.filter((day) => !day.isSame(item.date, 'D'))
                    }
                    return [...prev, item.date]
                  })
                }
              />
              <span className="ml-4">
                <span>{item.name}</span>
                {dayjs().isSame(item.date, 'D') && (
                  <span className="ml-1 text-sm text-black/40 dark:text-white/40">
                    ({t('Today')})
                  </span>
                )}
              </span>
            </label>
            <Space className="ml-auto">
              <Button
                type="primary"
                size="small"
                disabled={item.date.isSame(
                  dayjs(scanStore.scanStoreData.scanDate),
                  'D',
                )}
                onClick={() => onView(item.date)}
              >
                {t('View')}
              </Button>
              <Button
                size="small"
                disabled={isExporting}
                onClick={() => onExport(item.date)}
              >
                {t('Export')}
              </Button>
            </Space>
          </List.Item>
        ))}
      </List>
    ),
  }))

  return (
    <>
      <Button icon={<HistoryOutlined />} onClick={onClick}>
        {t('History')}
      </Button>
      <Drawer
        closable
        destroyOnClose
        title={t('History')}
        placement="right"
        open={open}
        loading={isLoadDataPending}
        width={560}
        onClose={() => setOpen(false)}
      >
        <Flex gap="small" className="mb-4">
          <label className="cursor-pointer">
            <Checkbox
              checked={selectAll}
              onChange={() => onSelectAllChange(!selectAll)}
            />
            <span className="ml-2">{t('Select All')}</span>
          </label>
          <Space size="middle" className="ml-auto">
            <div>{t('Selected Items', { count: selectedDays.length })}</div>
            <Button
              loading={isExporting}
              icon={<ExportOutlined />}
              disabled={!selectedDays.length || isExporting}
              onClick={onBatchExport}
            >
              {t('Batch Export')}
            </Button>
          </Space>
        </Flex>
        {exportList.length ? (
          <Collapse
            defaultActiveKey={[months[0]]}
            ghost
            items={collapseItems}
            className="[&_.ant-collapse-header]:!px-0"
          />
        ) : (
          <Empty />
        )}
      </Drawer>
      {holder}
    </>
  )
}

export default HistoryDawerButton
