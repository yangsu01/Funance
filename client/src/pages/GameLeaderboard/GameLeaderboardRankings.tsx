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
        <MultiTimeSeriesPlot timeSeriesData={plotData} title={plotTitle} />
        <PaginationTable
          headers={tableHeaders}
          content={tableData}
          itemsPerPage={5}
        />
      </Card.Body>
    </Card>
  );
};

export default GameLeaderboardRankings;
