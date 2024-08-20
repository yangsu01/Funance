import { useState } from "react";
import { Row, Button } from "react-bootstrap";
// components
import PaginationTable from "../../components/UI/PaginationTable";
import AccordionCard from "../../components/UI/AccordionCard";
import EmptyMessage from "../../components/UI/EmptyMessage";

//types
import { PendingOrders } from "../../utils/types";
// constants
import { PENDING_ORDERS_TABLE_HEADERS } from "../../utils/constants";

type Props = {
  pendingOrders: PendingOrders[];
  onCancelOrder: (id: number | string) => void;
};

const PortfolioOrders = ({ pendingOrders, onCancelOrder }: Props) => {
  const [show, setShow] = useState(false);

  const handleShow = () => setShow(!show);

  return (
    <>
      <AccordionCard header={"Pending Orders"} open={pendingOrders.length > 0}>
        {pendingOrders.length > 0 ? (
          <Row>
            <PaginationTable
              headers={PENDING_ORDERS_TABLE_HEADERS}
              content={pendingOrders}
              onAction={onCancelOrder}
              actionName="Cancel"
              idColumn="id"
            />
          </Row>
        ) : (
          <Row>
            <EmptyMessage title="You do not have any Pending Orders" />
          </Row>
        )}

        <Row className="mt-3">
          <Button
            variant="outline-light"
            size="sm"
            className="mb-3 ms-3"
            style={{ maxWidth: "130px" }}
            onClick={() => handleShow()}
          >
            Orders Reference
          </Button>
          {show && (
            <small className="text-muted">
              <ul>
                <li>
                  Limit Buy: executes when current price is below target price
                </li>
                <li>
                  Limit Sell: executes when current price is above target price
                </li>
                <li>
                  Stop-Loss: executes when current price falls below target
                  price
                </li>
                <li>
                  Market Buy/Sell: executes at market price when markets open or
                  when game starts
                </li>
                <li>
                  Orders will be executed in chronological order based on when
                  it was placed
                </li>
                <li>
                  If not enough cash is available to fill order, order will be
                  partially filled or cancelled
                </li>
              </ul>
            </small>
          )}
        </Row>
      </AccordionCard>
    </>
  );
};

export default PortfolioOrders;
