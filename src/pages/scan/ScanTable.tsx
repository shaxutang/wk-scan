import { useScanStore } from '@/stores/useScanStore'
import { ScanDataType } from '@/types'
import dayjs from '@/utils/dayjs'
import { RCode } from '@/utils/R'
import { Table, TableProps, Tag } from 'antd'
import { useEffect, useState } from 'react'
import SearchForm from './SearchForm'

const columns: TableProps<ScanDataType>['columns'] = [
  {
    title: '扫码对象名称',
    dataIndex: 'scanObjectName',
    key: 'scanObjectName',
    render: (text) => text,
  },
  {
    title: '扫码对象编号',
    dataIndex: 'qrcode',
    key: 'qrcode',
    render: (text) => text,
  },
  {
    title: '测试状态',
    key: 'state',
    dataIndex: 'state',
    render: () => <Tag color="success">测试通过</Tag>,
  },
  {
    title: '测试时间',
    key: 'date',
    render: ({ date }) => dayjs(date).format('YYYY/MM/DD HH:mm:ss'),
  },
]

const ScanTable: React.FC<{}> = () => {
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
          showTotal: (total) => `共 ${total} 条数据`,
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
