import { useScanStore } from '@/stores/useScanStore'
import dayjs from '@/utils/dayjs'
import { RCode } from '@/utils/R'
import { ExportOutlined, HistoryOutlined } from '@ant-design/icons/lib'
import {
  Button,
  Checkbox,
  Drawer,
  Empty,
  Flex,
  List,
  message,
  Space,
} from 'antd'
import { Dayjs } from 'dayjs'
import { useState, useTransition } from 'react'

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
  const [isBatchPending, startBatchTransition] = useTransition()
  const [isLoadDataPending, startLoadDataTransition] = useTransition()
  const scanStore = useScanStore()

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
    const { code, message } = await window.electron.exportScanData({
      scanObject: scanStore.scanStoreData.scanObject,
      scanDates: [date.format('YYYY-MM-DD')],
    })
    if (code === RCode.SUCCESS) {
      messageApi.success('导出成功')
      window.electron.openExportExplorer(scanStore.scanStoreData.scanObject)
    } else {
      messageApi.error(message)
    }
  }

  const onBatchExport = async () => {
    startBatchTransition(() => {
      window.electron
        .exportScanData({
          scanObject: scanStore.scanStoreData.scanObject,
          scanDates: selectedDays.map((day) => day.format('YYYY-MM-DD')),
        })
        .then((res) => {
          if (res.code === RCode.SUCCESS) {
            messageApi.success('导出成功')
            window.electron.openExportExplorer(
              scanStore.scanStoreData.scanObject,
            )
          } else {
            messageApi.error(res.message)
          }
        })
    })
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

  return (
    <>
      <Button icon={<HistoryOutlined />} onClick={onClick}>
        历史记录
      </Button>
      <Drawer
        closable
        destroyOnClose
        title="历史记录"
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
            <span className="ml-2">全选</span>
          </label>
          <Space size="middle" className="ml-auto">
            <div>已选择「{selectedDays.length}」项</div>
            <Button
              loading={isBatchPending}
              icon={<ExportOutlined />}
              disabled={!selectedDays.length}
              onClick={onBatchExport}
            >
              批量导出
            </Button>
          </Space>
        </Flex>
        <List className="space-y-4">
          {exportList.length ? (
            exportList.map((item) => (
              <List.Item
                key={item.date.valueOf()}
                className="flex items-center text-xl"
              >
                <label className="flex cursor-pointer items-center text-xl">
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
                        (今天)
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
                    查看
                  </Button>
                  <Button size="small" onClick={() => onExport(item.date)}>
                    导出
                  </Button>
                </Space>
              </List.Item>
            ))
          ) : (
            <Empty />
          )}
        </List>
      </Drawer>
      {holder}
    </>
  )
}

export default HistoryDawerButton
