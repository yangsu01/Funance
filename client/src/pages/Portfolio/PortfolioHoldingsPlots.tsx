import { Row, Col } from "react-bootstrap";

// components
import PieChart from "../../components/Plots/PieChart";
import AccordionCard from "../../components/UI/AccordionCard";
import EmptyMessage from "../../components/UI/EmptyMessage";
// types
import { PiePlotData } from "../../utils/types";

type Props = {
  breakdownData: PiePlotData;
  sectorData: PiePlotData;
};

const PortfolioHoldingsPlots = ({ breakdownData, sectorData }: Props) => {
  return (
    <AccordionCard header="Holdings Breakdown">
      {breakdownData.labels ? (
        <Row>
          <Col md={6} className="mb-4">
            <PieChart plotData={breakdownData} title="Holdings Breakdown" />
          </Col>

          <Col md={6} className="mb-4">
            <PieChart plotData={sectorData} title="Sector Breakdown" />
          </Col>
        </Row>
      ) : (
        <EmptyMessage
          title="You do not own anything!"
          subtitle="Buy some stocks first to see the breakdown."
        />
      )}
    </AccordionCard>
  );
};

export default PortfolioHoldingsPlots;
