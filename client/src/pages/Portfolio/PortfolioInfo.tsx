import { Row, Col } from "react-bootstrap";

// components
import InfoCard from "../../components/UI/InfoCard";
import PortfolioButtonGroup from "./PortfolioButtonGroup";
import ChangeColors from "../../components/UI/ChangeColors";
// types
import { PortfolioDetails, UserPortfolios } from "../../utils/types";

type Props = {
  data: PortfolioDetails;
  portfolios: UserPortfolios[];
  portfolioId: number;
  hasHoldings: boolean;
};

const PortfolioInfo = ({
  data,
  portfolios,
  portfolioId,
  hasHoldings,
}: Props) => {
  return (
    <Row className="d-flex align-items-end">
      <Col md={6} className="mb-3">
        <PortfolioButtonGroup
          hasHoldings={hasHoldings}
          gameStatus={data.gameStatus}
          portfolios={portfolios}
          portfolioId={portfolioId}
        />

        <InfoCard
          title={`Your Portfolio is Worth: $${data.portfolioValue}`}
          subtitle={`With $${data.availableCash} available cash`}
          infoList={[
            <>
              All time change:{" "}
              <ChangeColors num={data.profit} percentage={false} /> (
              <ChangeColors num={data.change} percentage={true} />)
            </>,
            <>
              Day change:{" "}
              <ChangeColors num={data.dayChange} percentage={false} /> (
              <ChangeColors num={data.dayChangePercent} percentage={true} />)
            </>,
          ]}
          footer={`Last updated: ${data.lastUpdated}`}
        />
      </Col>
      <Col md={6} className="mb-3">
        <InfoCard
          title={`Current Rank: ${data.overallRank} of ${data.participants}`}
          subtitle={`Game ${data.gameStatus}`}
          infoList={[
            `Start date: ${data.gameStartDate}`,
            `End date: ${data.gameEndDate}`,
            `Starting cash: $${data.startingCash}`,
            `Transaction fee: ${data.transactionFee} per transaction`,
          ]}
        />
      </Col>
    </Row>
  );
};

export default PortfolioInfo;
