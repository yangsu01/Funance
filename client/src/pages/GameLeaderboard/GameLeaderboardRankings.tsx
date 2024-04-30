import React from "react";

import { Row, Col, Card } from "react-bootstrap";

import MultiTimeSeriesPlot from "../../components/Plots/MultiTimeSeriesPlot";
import PaginationTable from "../../components/UI/PaginationTable";

type Props<PlotData, TableData> = {
  title: string;
  subtitle: string;
  plotTitle: string;
  plotData: PlotData;
  tableHeaders: string[];
  tableData: TableData;
};

const GameLeaderboardRankings: React.FC<Props<any, any>> = ({
  title,
  subtitle,
  plotTitle,
  plotData,
  tableHeaders,
  tableData,
}) => {
  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title>
          <h2>{title}</h2>
        </Card.Title>
        <Card.Subtitle>
          <small className="text-muted">{subtitle}</small>
        </Card.Subtitle>
        <Row className="d-flex align-items-center">
          <Col lg={6}>
            <MultiTimeSeriesPlot timeSeriesData={plotData} title={plotTitle} />
          </Col>
          <Col lg={6}>
            <PaginationTable headers={tableHeaders} content={tableData} />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default GameLeaderboardRankings;
