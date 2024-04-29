import React from "react";
import { Row, Col, Card, Accordion } from "react-bootstrap";

import TimeSeriesPlot from "../../components/Plots/TimeSeriesPlot";

import { LinePlotData } from "../../utils/types";

type Props = {
  closeData: LinePlotData;
  dailyData: LinePlotData;
  gameStatus: string;
  date: string;
};

const PortfolioHistoryPlots: React.FC<Props> = ({
  closeData,
  dailyData,
  gameStatus,
  date,
}) => {
  const plotWidth = gameStatus === "In Progress" ? 6 : 12;

  return (
    <Accordion className="mb-3" defaultActiveKey={["0"]} alwaysOpen>
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          <strong>Performance Plots</strong>
        </Accordion.Header>
        <Accordion.Body>
          <Row>
            <Col md={plotWidth} className="mb-4">
              <TimeSeriesPlot plotData={closeData} title="Portfolio History" />
            </Col>

            {gameStatus === "In Progress" && (
              <Col md={plotWidth} className="mb-4">
                <TimeSeriesPlot
                  plotData={dailyData}
                  title={`Performance for ${date}`}
                />
              </Col>
            )}
          </Row>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

export default PortfolioHistoryPlots;
