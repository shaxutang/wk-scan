import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons'
import { Card, Col, Row, Statistic } from 'antd'
import React from 'react'
import { useTranslation } from 'react-i18next'

export interface StatisticsProps {
  lastHourCapacity: number
  totalCapacity: number
  speed: number
  growth: number
}

const Statistics: React.FC<StatisticsProps> = ({
  lastHourCapacity,
  totalCapacity,
  speed,
  growth,
}) => {
  const { t } = useTranslation()
  const isGrowth = growth >= 0
  const icon = isGrowth ? <ArrowUpOutlined /> : <ArrowDownOutlined />
  const valueStyle = {
    color: isGrowth ? '#3f8600' : '#cf1362',
    fontWeight: 400,
    fontSize: 36,
  }

  return (
    <Row gutter={[16, 16]}>
      <Col span={12} xl={{ span: 6 }}>
        <Card>
          <Statistic
            title={t('Latest Period Capacity')}
            value={lastHourCapacity}
            precision={0}
            valueStyle={{ fontWeight: 400, fontSize: 36 }}
            suffix="pcs"
          />
        </Card>
      </Col>
      <Col span={12} xl={{ span: 6 }}>
        <Card>
          <Statistic
            title={t('Total Capacity')}
            value={totalCapacity}
            valueStyle={{ fontWeight: 400, fontSize: 36 }}
            precision={0}
            suffix="pcs"
          />
        </Card>
      </Col>
      <Col span={12} xl={{ span: 6 }}>
        <Card>
          <Statistic
            title={t('Production Speed')}
            value={speed.toFixed(2)}
            precision={2}
            valueStyle={{ color: '#1677ff', fontWeight: 400, fontSize: 36 }}
            suffix={t('pcs/hour')}
          />
        </Card>
      </Col>
      <Col span={12} xl={{ span: 6 }}>
        <Card>
          <Statistic
            title={t('Hourly Capacity Growth')}
            value={(growth * 100).toFixed(2)}
            precision={2}
            prefix={icon}
            valueStyle={valueStyle}
            suffix="%"
          />
        </Card>
      </Col>
    </Row>
  )
}

export default Statistics
