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
import { useCallback, useMemo, useState, useTransition } from 'react'
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
  const [activeKeys, setActiveKeys] = useState<string[]>([])
  const scanStore = useScanStore()
  const { t } = useTranslation()

  const onClick = useCallback(async () => {
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
            // Set first month as active if no active keys
            if (activeKeys.length === 0) {
              const months = Object.keys(groupData(list)).sort((a, b) => {
                return dayjs(b).valueOf() - dayjs(a).valueOf()
              })
              setActiveKeys([months[0]])
            }
          }
        })
    })
  }, [activeKeys.length, scanStore.scanStoreData.scanObject])

  const onExport = useCallback(
    async (date: Dayjs) => {
      setIsExporting(true)
      try {
        const { code, message } = await window.electron.exportScanData({
          scanObject: scanStore.scanStoreData.scanObject,
          scanDates: [date.format('YYYY-MM-DD')],
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
    },
    [messageApi, scanStore.scanStoreData.scanObject, t],
  )

  const onBatchExport = useCallback(async () => {
    setIsExporting(true)
    try {
      const res = await window.electron.exportScanData({
        scanObject: scanStore.scanStoreData.scanObject,
        scanDates: selectedDays.map((day) => day.format('YYYY-MM-DD')),
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
  }, [messageApi, scanStore.scanStoreData.scanObject, selectedDays, t])

  const onView = useCallback(
    (scanDate: Dayjs) => {
      scanStore.setScanStoreData({
        ...scanStore.scanStoreData,
        scanDate: scanDate.toDate().getTime(),
      })
      setOpen(false)
    },
    [scanStore],
  )

  const onSelectAllChange = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedDays(exportList.map((item) => item.date))
      } else {
        setSelectedDays([])
      }
      setSelectAll(checked)
    },
    [exportList],
  )

  // Group data by month
  const groupData = useCallback((list: typeof exportList) => {
    return list.reduce(
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
  }, [])

  const groupedData = useMemo(
    () => groupData(exportList),
    [exportList, groupData],
  )

  // Sort months in descending order
  const months = useMemo(
    () =>
      Object.keys(groupedData).sort(
        (a, b) => dayjs(b).valueOf() - dayjs(a).valueOf(),
      ),
    [groupedData],
  )

  const onSelectMonth = useCallback(
    (month: string, checked: boolean) => {
      setSelectedDays((prev) => {
        if (checked) {
          return [...prev, ...groupedData[month].map((item) => item.date)]
        }
        return prev.filter(
          (day) =>
            !groupedData[month].some((item) => item.date.isSame(day, 'D')),
        )
      })
    },
    [groupedData],
  )

  const collapseItems = useMemo(
    () =>
      months.map((month) => ({
        key: month,
        label: (
          <Flex align="center" gap="middle">
            <Checkbox
              checked={groupedData[month].every((item) =>
                selectedDays.some((day) => day.isSame(item.date, 'D')),
              )}
              indeterminate={
                groupedData[month].some((item) =>
                  selectedDays.some((day) => day.isSame(item.date, 'D')),
                ) &&
                !groupedData[month].every((item) =>
                  selectedDays.some((day) => day.isSame(item.date, 'D')),
                )
              }
              onClick={(e) => {
                e.stopPropagation()
                const checked = !groupedData[month].every((item) =>
                  selectedDays.some((day) => day.isSame(item.date, 'D')),
                )
                onSelectMonth(month, checked)
              }}
            />
            <span>{dayjs(month).format('YYYY - MM')}</span>
          </Flex>
        ),
        children: (
          <List className="space-y-4">
            {groupedData[month].map((item) => (
              <List.Item
                key={item.date.valueOf()}
                className="flex items-center text-xl"
              >
                <label className="flex cursor-pointer items-center text-lg">
                  <Checkbox
                    checked={selectedDays.some((day) =>
                      day.isSame(item.date, 'D'),
                    )}
                    onClick={() =>
                      setSelectedDays((prev) => {
                        const exists = prev.some((day) =>
                          day.isSame(item.date, 'D'),
                        )
                        if (exists) {
                          return prev.filter(
                            (day) => !day.isSame(item.date, 'D'),
                          )
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
      })),
    [
      groupedData,
      selectedDays,
      isExporting,
      onExport,
      onView,
      onSelectMonth,
      scanStore.scanStoreData.scanDate,
      t,
    ],
  )

  return (
    <>
      <Button icon={<HistoryOutlined />} onClick={onClick}>
        {t('History')}
      </Button>
      <Drawer
        closable
        destroyOnClose={false}
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
              indeterminate={
                selectedDays.length > 0 &&
                selectedDays.length < exportList.length
              }
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
            activeKey={activeKeys}
            onChange={(keys) => setActiveKeys(keys as string[])}
            ghost
            items={collapseItems}
            className="[&_.ant-collapse-content-box]:!px-8 [&_.ant-collapse-header]:!px-0"
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
