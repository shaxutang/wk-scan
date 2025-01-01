import { useDark } from '@/hooks/useDark'
import { Snapshot } from '@/types'
import { Line, LineConfig } from '@ant-design/plots'
import { Card, Empty, Space, Typography } from 'antd'
import { BaseType } from 'antd/es/typography/Base'
import React from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()

  const { trendAnalysis, trendStatus } = React.useMemo(() => {
    const chartData = snapshot.charData
    if (!chartData || chartData.length < 2) {
      return {
        trendAnalysis: t('Insufficient Data'),
        trendStatus: 'stable',
      }
    }

    const capacities = chartData.map((d) => d.capacity)
    const lastCapacity = capacities[capacities.length - 1]
    const avgCapacity =
      capacities.reduce((a, b) => a + b, 0) / capacities.length
    const stdDev = Math.sqrt(
      capacities.reduce((sum, val) => sum + Math.pow(val - avgCapacity, 2), 0) /
        capacities.length,
    )

    let analysis = ''
    let status = 'stable'

    // 分析最近一小时的变化
    if (snapshot.growth > 0) {
      analysis = t('Trend Up', {
        value: (snapshot.growth * 100).toFixed(2),
        comparison: t(lastCapacity > avgCapacity ? 'Higher' : 'Lower'),
        diff: Math.abs(lastCapacity - avgCapacity).toFixed(0),
      })
      status = 'up'
    } else if (snapshot.growth < 0) {
      analysis = t('Trend Down', {
        value: (Math.abs(snapshot.growth) * 100).toFixed(2),
        comparison: t(lastCapacity > avgCapacity ? 'Higher' : 'Lower'),
        diff: Math.abs(lastCapacity - avgCapacity).toFixed(0),
      })
      status = 'down'
    } else {
      analysis = t('Trend Stable')
      status = 'stable'
    }

    return {
      trendAnalysis: analysis,
      trendStatus: status,
    }
  }, [snapshot.charData, snapshot.growth, t])

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
            nameDiv.textContent =
              item.name === 'capacity' ? t('Capacity') : t('Time')

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
          <Text>{t('Hourly Capacity Distribution')}</Text>
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
        <Empty description={t('No Data')} />
      )}
    </Card>
  )
}

export default Chart
