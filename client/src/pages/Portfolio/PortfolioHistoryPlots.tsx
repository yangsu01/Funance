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
          <TimeSeriesPlot
            plotData={closeData}
            label={{
              title: "Historical Portfolio Value",
              xLabel: "Date",
              yLabel: "Value ($)",
              xUnit: "day",
            }}
          />
          <small className="text-muted">
            *Updated daily when markets close
          </small>
        </Col>

        {gameStatus === "In Progress" && (
          <Col md={plotWidth} className="mb-4">
            <TimeSeriesPlot
              plotData={dailyData}
              label={{
                title: `%Growth for ${date}`,
                xLabel: "Time",
                yLabel: "Change (%)",
                xUnit: "minute",
              }}
              radius={4}
            />
            <small className="text-muted">
              *Updated every 5 minutes during market hours
            </small>
          </Col>
        )}
      </Row>
    </AccordionCard>
  );
};

export default PortfolioHistoryPlots;
