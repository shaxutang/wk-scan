import { useScanStore } from '@/stores/useScanStore'
import { ScanDataType } from '@/types'
import dayjs from '@/utils/dayjs'
import { RCode } from '@/utils/R'
import { Table, TableProps, Tag } from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import SearchForm from './SearchForm'

const ScanTable: React.FC<{}> = () => {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [page, setPage] = useState<{
    current: number
    size: number
  }>({
    current: 1,
    size: 10,
  })
  const [dataSource, setDataSource] = useState<{
    total: number
    records: ScanDataType[]
  }>({
    total: 0,
    records: [],
  })
  const scanStore = useScanStore()

  const columns: TableProps<ScanDataType>['columns'] = [
    {
      title: t('Scan Object Name'),
      dataIndex: 'scanObjectName',
      key: 'scanObjectName',
      render: (text) => text,
    },
    {
      title: t('Scan Object Number'),
      dataIndex: 'qrcode',
      key: 'qrcode',
      render: (text) => text,
    },
    {
      title: t('Test Status'),
      key: 'state',
      dataIndex: 'state',
      render: () => <Tag color="success">{t('Test Passed')}</Tag>,
    },
    {
      title: t('Test Time'),
      key: 'date',
      render: ({ date }) => dayjs(date).format('YYYY/MM/DD HH:mm:ss'),
    },
  ]

  const scanStoreData = scanStore.scanStoreData

  useEffect(() => {
    ;(async () => {
      const { code, data } = await window.electron.getScanPageList({
        ...page,
        scanObject: scanStoreData.scanObject,
        scanDate: dayjs(scanStoreData.scanDate).format('YYYY-MM-DD'),
        qrcode: input,
      })
      if (code === RCode.SUCCESS) {
        setDataSource(data)
      }
    })()
  }, [input, page])

  const onSearch = (qrcode: string) => {
    setInput(qrcode)
    setPage({
      ...page,
      current: 1,
    })
  }

  const onReset = () => {
    setInput('')
    setPage({
      ...page,
      current: 1,
    })
  }

  return (
    <>
      <div className="mb-4">
        <SearchForm value={input} onSubmit={onSearch} onReset={onReset} />
      </div>
      <Table<ScanDataType>
        columns={columns}
        dataSource={dataSource.records}
        rowKey="qrcode"
        scroll={{ y: 800 }}
        virtual={true}
        pagination={{
          current: page.current,
          total: dataSource.total,
          pageSizeOptions: [10, 20, 30, 40, 50],
          pageSize: page.size,
          showTotal: (total) => t('Total Items', { total }),
          onChange: (page, size) => {
            setPage({
              current: page,
              size,
            })
          },
        }}
      />
    </>
  )
}

export default ScanTable
