import { useDark } from '@/hooks/useDark'
import { Snapshot } from '@/types'
import { Line, LineConfig } from '@ant-design/plots'
import { Card, Empty, Space, Typography } from 'antd'
import { BaseType } from 'antd/es/typography/Base'
import React from 'react'
import ScanListButton from './ScanListButton'

export type ChartData = {
  time: string
  capacity: number
}

export interface ChartProps {
  snapshot: Snapshot
  className?: string
}

const Chart: React.FC<ChartProps> = ({ snapshot, className }) => {
  const { isDark } = useDark()
  const { Text } = Typography

  const { trendAnalysis, trendStatus, encouragement } = React.useMemo(() => {
    const chartData = snapshot.charData
    if (!chartData || chartData.length < 2) {
      return {
        trendAnalysis: '数据量不足，无法分析趋势',
        trendStatus: 'stable',
        encouragement: '开始记录数据，让我们一起见证成长!',
      }
    }

    const capacities = chartData.map((d) => d.capacity)
    const lastCapacity = capacities[capacities.length - 1]

    // 计算平均产能和标准差
    const avgCapacity =
      capacities.reduce((a, b) => a + b, 0) / capacities.length
    const stdDev = Math.sqrt(
      capacities.reduce((sum, val) => sum + Math.pow(val - avgCapacity, 2), 0) /
        capacities.length,
    )

    let analysis = ''
    let status = 'stable'
    let encourageMsg = ''

    // 分析最近一小时的变化
    if (snapshot.growth > 0) {
      analysis = `最近一小时产能上升 ${(snapshot.growth * 100).toFixed(2)}%，相比平均水平${
        lastCapacity > avgCapacity ? '高' : '低'
      } ${Math.abs(lastCapacity - avgCapacity).toFixed(0)} pcs`
      status = 'up'
      encourageMsg = '产能持续上升，继续保持这个势头！'
    } else if (snapshot.growth < 0) {
      analysis = `最近一小时产能下降 ${(Math.abs(snapshot.growth) * 100).toFixed(2)}%，相比平均水平${
        lastCapacity > avgCapacity ? '高' : '低'
      } ${Math.abs(lastCapacity - avgCapacity).toFixed(0)} pcs`
      status = 'down'
      encourageMsg = '暂时的下降不要紧，调整状态，一定能重回正轨！'
    } else {
      analysis = '最近一小时产能保持稳定'
      status = 'stable'
      encourageMsg = '产能保持稳定，这就是最好的表现！'
    }

    // 添加波动情况分析
    if (stdDev / avgCapacity > 0.2) {
      analysis += '，产能波动较大'
    } else if (stdDev / avgCapacity > 0.1) {
      analysis += '，产能波动适中'
    } else {
      analysis += '，产能波动较小'
    }

    return {
      trendAnalysis: analysis + '，' + encourageMsg,
      trendStatus: status,
    }
  }, [snapshot.charData, snapshot.growth])

  const config: LineConfig = {
    theme: isDark ? 'classicDark' : 'classic',
    data: snapshot.charData,
    xField: 'time',
    yField: 'capacity',
    point: {
      shapeField: 'square',
      sizeField: 4,
    },
    interaction: {
      tooltip: {
        marker: false,
        render: (event: any, { title, items }: any) => {
          const div = document.createElement('div')
          div.className = 'space-y-3 p-2 dark:text-white'

          items.forEach((item: any) => {
            const row = document.createElement('div')
            row.className = 'flex items-center justify-between gap-4'

            const nameDiv = document.createElement('div')
            nameDiv.className = 'font-medium'
            nameDiv.textContent = item.name === 'capacity' ? '产能' : '时间'

            const valueDiv = document.createElement('div')
            valueDiv.className = 'font-medium'
            valueDiv.textContent =
              item.value + (item.name === 'capacity' ? ' pcs' : '')

            row.appendChild(nameDiv)
            row.appendChild(valueDiv)
            div.appendChild(row)
          })

          return div
        },
      },
    },
    style: {
      lineWidth: 2,
    },
  }

  const trendStatusType: BaseType =
    trendStatus === 'up'
      ? 'success'
      : trendStatus === 'down'
        ? 'danger'
        : 'secondary'
  return (
    <Card
      size="small"
      title={
        <Space>
          <Text>小时产能分布图</Text>
          <Text type={trendStatusType}>{trendAnalysis}</Text>
        </Space>
      }
      styles={{
        header: {
          padding: '16px 24px',
        },
        body: {
          padding: '16px',
        },
      }}
      extra={<ScanListButton />}
      className={className}
    >
      {snapshot.charData.length ? (
        <Line {...config} viewStyle={{ height: 600 }} />
      ) : (
        <Empty description="暂无数据" />
      )}
    </Card>
  )
}

export default Chart
