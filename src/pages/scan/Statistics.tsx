import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons'
import { Card, Col, Row, Statistic } from 'antd'
import React from 'react'

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
  const isGrowth = growth >= 0
  const icon = isGrowth ? <ArrowUpOutlined /> : <ArrowDownOutlined />
  const valueStyle = {
    color: isGrowth ? '#3f8600' : '#cf1362',
    fontWeight: 400,
    fontSize: 36,
  }

  return (
    <Row gutter={16}>
      <Col span={6}>
        <Card>
          <Statistic
            title="最新时间段产能"
            value={lastHourCapacity}
            precision={0}
            valueStyle={{ fontWeight: 400, fontSize: 36 }}
            suffix="pcs"
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="总产能"
            value={totalCapacity}
            valueStyle={{ fontWeight: 400, fontSize: 36 }}
            precision={0}
            suffix="pcs"
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="生产速度"
            value={speed.toFixed(2)}
            precision={2}
            valueStyle={{ color: '#1677ff', fontWeight: 400, fontSize: 36 }}
            suffix="pcs /小时"
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="小时产能同比增长"
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
