import { Row, Col } from "react-bootstrap";

// components
import TimeSeriesPlot from "../../components/Plots/TimeSeriesPlot";
import AccordionCard from "../../components/UI/AccordionCard";
// types
import { LinePlotData } from "../../utils/types";

type Props = {
  closeData: LinePlotData;
  dailyData: LinePlotData;
  gameStatus: string;
  date: string;
};

const PortfolioHistoryPlots = ({
  closeData,
  dailyData,
  gameStatus,
  date,
}: Props) => {
  const plotWidth = gameStatus === "In Progress" ? 6 : 12;

  return (
    <AccordionCard header="Performance Plots">
      <Row>
        <Col md={plotWidth} className="mb-4">
          <TimeSeriesPlot plotData={closeData} title="Portfolio History" />
          <small className="text-muted">
            *Updated daily when markets close
          </small>
        </Col>

        {gameStatus === "In Progress" && (
          <Col md={plotWidth} className="mb-4">
            <TimeSeriesPlot
              plotData={dailyData}
              title={`Performance for ${date}`}
            />
            <small className="text-muted">
              *Updated every 30 minutes during market hours
            </small>
          </Col>
        )}
      </Row>
    </AccordionCard>
  );
};

export default PortfolioHistoryPlots;
