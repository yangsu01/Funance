import React from "react";
import { Row } from "react-bootstrap";

import PaginationTable from "../../components/UI/PaginationTable";
import AccordionCard from "../../components/UI/AccordionCard";

type Props<TableData> = {
  title: string;
  tableHeaders: string[];
  tableData: TableData;
};

const PortfolioTable: React.FC<Props<any>> = ({
  title,
  tableHeaders,
  tableData,
}) => {
  return (
    <>
      {tableData.length > 0 && (
        <AccordionCard header={title}>
          <Row>
            <PaginationTable headers={tableHeaders} content={tableData} />
          </Row>
        </AccordionCard>
      )}
    </>
  );
};

export default PortfolioTable;
