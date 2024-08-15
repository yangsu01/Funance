import { useState } from "react";
import { Card, Dropdown, Row, Col } from "react-bootstrap";

// components
import MultiTimeSeriesPlot from "../../components/Plots/MultiTimeSeriesPlot";
import PaginationTable from "../../components/UI/PaginationTable";
// types
import {
  TimeSeriesPlotData,
  TopPortfolio,
  DailyPortfolio,
  LineChartLabel,
  LeaderboardFilterOptions,
} from "../../utils/types";

type Props = {
  title: string;
  subtitle: string;
  chartLabel: LineChartLabel;
  plotData: TimeSeriesPlotData[];
  tableHeaders: string[];
  tableData: TopPortfolio[] | DailyPortfolio[];
  filterData: string;
  onFilter: (filterData: string, filter: string) => void;
};

const GameLeaderboardRankings = ({
  title,
  subtitle,
  chartLabel,
  plotData,
  tableHeaders,
  tableData,
  filterData,
  onFilter,
}: Props) => {
  const [selectedFilter, setSelectedFilter] = useState("Top 5");

  const handleFilter = (filter: LeaderboardFilterOptions) => {
    setSelectedFilter(filter);

    switch (filter) {
      case "Top 5":
        onFilter(filterData, "top5");
        break;
      case "Bottom 5":
        onFilter(filterData, "bottom5");
        break;
      case "All":
        onFilter(filterData, "all");
        break;
    }
  };

  return (
    <Card className="mb-3">
      <Card.Body>
        <Row className="d-flex align-items-center">
          <Col md={8} className="mb-3">
            <Card.Title>
              <h2>{title}</h2>
            </Card.Title>
            <Card.Subtitle>
              <small className="text-muted">{subtitle}</small>
            </Card.Subtitle>
          </Col>
          <Col md={4} className="d-flex justify-content-end mb-3">
            <Dropdown
              onSelect={(eventKey) =>
                handleFilter(eventKey as LeaderboardFilterOptions)
              }
            >
              <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
                Filter: {selectedFilter} Portfolios
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item
                  eventKey="Top 5"
                  active={selectedFilter === "Top 5"}
                >
                  Top 5
                </Dropdown.Item>
                <Dropdown.Item
                  eventKey="Bottom 5"
                  active={selectedFilter === "Bottom 5"}
                >
                  Bottom 5
                </Dropdown.Item>
                <Dropdown.Item eventKey="All" active={selectedFilter === "All"}>
                  All
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>

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
