import React from "react";

import { Accordion, Row, Col, Button, Container } from "react-bootstrap";

import { GameDetails } from "../../utils/types";

import InfoCard from "../../components/UI/InfoCard";

type Props = {
  details: GameDetails;
  onJoin: () => void;
};

const GameLeaderboardInfo: React.FC<Props> = ({ details, onJoin }) => {
  return (
    <Accordion className="mb-3">
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          <strong>Game Info</strong>
        </Accordion.Header>
        <Accordion.Body>
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
                  `Status: ${details.status}`,
                  `Updated: ${details.lastUpdated}`,
                ]}
              />
              <Container className="d-flex justify-content-end mt-4">
                {details.status !== "Completed" && !details.joinedGame && (
                  <Button variant="outline-light" size="lg" onClick={onJoin}>
                    Join Game
                  </Button>
                )}
              </Container>
            </Col>
          </Row>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

export default GameLeaderboardInfo;
