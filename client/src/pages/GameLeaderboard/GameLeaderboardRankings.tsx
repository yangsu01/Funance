import { Card } from "react-bootstrap";

// components
import MultiTimeSeriesPlot from "../../components/Plots/MultiTimeSeriesPlot";
import PaginationTable from "../../components/UI/PaginationTable";
// types
import {
  TimeSeriesPlotData,
  TopPortfolio,
  DailyPortfolio,
  LineChartLabel,
} from "../../utils/types";

type Props = {
  title: string;
  subtitle: string;
  chartLabel: LineChartLabel;
  plotData: TimeSeriesPlotData[];
  tableHeaders: string[];
  tableData: TopPortfolio[] | DailyPortfolio[];
};

const GameLeaderboardRankings = ({
  title,
  subtitle,
  chartLabel,
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
        <MultiTimeSeriesPlot plotData={plotData} label={chartLabel} />
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
