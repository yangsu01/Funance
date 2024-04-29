import React from 'react'
import { Row, Col } from 'react-bootstrap'

import InfoCard from '../../components/UI/InfoCard'
import PortfolioSelectButton from './PortfolioSelectButton'

import { PortfolioDetails, UserPortfolios } from '../../utils/types'

type Props = {
    data: PortfolioDetails
    portfolios: UserPortfolios[]
}


const PortfolioInfo: React.FC<Props> = ( { data, portfolios } ) => {
  return (
    <Row className="d-flex align-items-end">
      <Col md={6} className="mb-3">
        <PortfolioSelectButton buttonName="Change Portfolios" portfolios={portfolios} />

        <InfoCard
          title={`Your portfolio is worth: $${data.portfolioValue}`}
          subtitle={`With $${data.availableCash} available cash`}
          text={`All time change: $${data.profit} (${data.change > 0 ? '📈' : '📉'} ${data.change}%)`}
          footer={`Last updated: ${data.lastUpdated}`}
        />
      </Col>
      <Col md={6} className="mb-3">
        <InfoCard
          title={`${data.gameName} Info`}
          subtitle={`Game ${data.gameStatus}`}
          infoList={[`Start date: ${data.gameStartDate}`, `End date: ${data.gameEndDate}`, `Transaction fee: ${data.transactionFee} per transaction`]}
        />
      </Col>
    </Row>
  )
}

export default PortfolioInfo