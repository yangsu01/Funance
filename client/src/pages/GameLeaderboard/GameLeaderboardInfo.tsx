import React from "react";

import { Row, Col } from "react-bootstrap";

import { GameDetails } from "../../utils/types";

import InfoCard from "../../components/UI/InfoCard";
import AccordionCard from "../../components/UI/AccordionCard";

type Props = {
  details: GameDetails;
};

const GameLeaderboardInfo: React.FC<Props> = ({ details }) => {
  return (
    <AccordionCard header="Game Info">
      <Row>
        <Col md={4} className="mb-3">
          <InfoCard
            title={details.name}
            subtitle={`Created by: ${details.creator}`}
            infoList={[
              `Participants: ${details.participants}`,
              `Start Date: ${details.startDate}`,
              `End Date: ${details.endDate}`,
            ]}
          />
        </Col>
        <Col md={4} className="mb-3">
          <InfoCard
            title="Game Settings"
            infoList={[
              `Game Duration: ${details.gameDuration}`,
              `Starting Cash: ${details.startingCash}`,
              `Transaction Fee: ${details.transactionFee}`,
              `Fee Type: ${details.feeType}`,
            ]}
          />
        </Col>
        <Col md={4} className="mb-3">
          <InfoCard
            title="Game Details"
            infoList={[
              `Game Duration: ${details.gameDuration}`,
              `Current Status: ${details.status}`,
              `Last Updated: ${details.lastUpdated}`,
            ]}
          />
        </Col>
      </Row>
    </AccordionCard>
  );
};

export default GameLeaderboardInfo;
