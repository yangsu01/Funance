import { Row, Col, Card } from "react-bootstrap";

// components
import MultiTimeSeriesPlot from "../../components/Plots/MultiTimeSeriesPlot";
import PaginationTable from "../../components/UI/PaginationTable";
// types
import {
  TimeSeriesPlotData,
  TopPortfolio,
  DailyPortfolio,
} from "../../utils/types";

type Props = {
  title: string;
  subtitle: string;
  plotTitle: string;
  plotData: TimeSeriesPlotData[];
  tableHeaders: string[];
  tableData: TopPortfolio[] | DailyPortfolio[];
};

const GameLeaderboardRankings = ({
  title,
  subtitle,
  plotTitle,
  plotData,
  tableHeaders,
  tableData,
}: Props) => {
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
