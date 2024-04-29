import React from "react";
import { Row, Col } from "react-bootstrap";

import InfoCard from "../../components/UI/InfoCard";
import PortfolioButtonGroup from "./PortfolioButtonGroup";

import { PortfolioDetails, UserPortfolios } from "../../utils/types";

type Props = {
  data: PortfolioDetails;
  portfolios: UserPortfolios[];
  portfolioId: number;
};

const PortfolioInfo: React.FC<Props> = ({ data, portfolios, portfolioId }) => {
  return (
    <Row className="d-flex align-items-end">
      <Col md={6} className="mb-3">
        <PortfolioButtonGroup
          buttonName="Change Portfolios"
          portfolios={portfolios}
          portfolioId={portfolioId}
        />

        <InfoCard
          title={`Your portfolio is worth: $${data.portfolioValue}`}
          subtitle={`With $${data.availableCash} available cash`}
          text={`All time change: $${data.profit} (${
            data.change > 0 ? "📈" : "📉"
          } ${data.change}%)`}
          footer={`Last updated: ${data.lastUpdated}`}
        />
      </Col>
      <Col md={6} className="mb-3">
        <InfoCard
          title={`${data.gameName} Info`}
          subtitle={`Game ${data.gameStatus}`}
          infoList={[
            `Start date: ${data.gameStartDate}`,
            `End date: ${data.gameEndDate}`,
            `Transaction fee: ${data.transactionFee} per transaction`,
          ]}
        />
      </Col>
    </Row>
  );
};

export default PortfolioInfo;
