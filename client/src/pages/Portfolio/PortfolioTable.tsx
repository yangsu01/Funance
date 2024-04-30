import { Row } from "react-bootstrap";

// components
import PaginationTable from "../../components/UI/PaginationTable";
import AccordionCard from "../../components/UI/AccordionCard";
// types
import { Transaction, Holding } from "../../utils/types";

type Props = {
  title: string;
  tableHeaders: string[];
  tableData: Transaction[] | Holding[];
};

const PortfolioTable = ({ title, tableHeaders, tableData }: Props) => {
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
