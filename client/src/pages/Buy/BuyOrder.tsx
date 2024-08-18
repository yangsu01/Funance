import { useState } from "react";
import { Dropdown, DropdownButton, Col } from "react-bootstrap";

// components
import CardWrapper from "../../components/UI/CardWrapper";
import ChangeColors from "../../components/UI/ChangeColors";
import BuyMarketForm from "./BuyMarketForm";
import BuyLimitForm from "./BuyLimitForm";
// types
import { BuyInfo, OrderTypes } from "../../utils/types";

type Props = {
  info: BuyInfo;
  currentPrice: number;
  dayChange: number;
  ticker: string;
  marketClosed: boolean;
  nextMarketDate: string;
  onBuy: (shares: number) => void;
  onOrder: (
    shares: number,
    orderType: OrderTypes,
    expiration: string | null,
    targetPrice: number | null
  ) => void;
};

const BuyOrder = ({
  info,
  currentPrice,
  dayChange,
  ticker,
  marketClosed,
  nextMarketDate,
  onBuy,
  onOrder,
}: Props) => {
  const [buyType, setBuyType] = useState("Market Buy");

  const handleOrderSelect = (eventKey: string | null) => {
    if (eventKey) {
      setBuyType(eventKey);
    }
  };

  return (
    <CardWrapper className="d-flex mb-3">
      <Col md={4} className="mx-auto">
        {marketClosed && (
          <>
            <h1 className="text-center">Market Closed</h1>
            <h6 className="text-center">
              Orders will be executed at next market open on {nextMarketDate}{" "}
              9:30 AM EST
            </h6>
          </>
        )}

        <h3 className="text-center mb-4">
          <strong>${currentPrice}</strong> (
          <ChangeColors num={dayChange} percentage={true} /> Past Day)
        </h3>

        <DropdownButton
          id="order-selector"
          title={`${ticker}: ${buyType}`}
          variant="outline-light"
          size="lg"
          className="mb-4 text-center"
          onSelect={handleOrderSelect}
        >
          <Dropdown.Item eventKey="Market Buy">Market Buy</Dropdown.Item>
          <Dropdown.Item eventKey="Limit Buy">Limit Buy</Dropdown.Item>
        </DropdownButton>

        {buyType === "Market Buy" && (
          <BuyMarketForm
            currentPrice={currentPrice}
            cash={info.availableCash}
            transactionFee={info.transactionFee}
            feeType={info.feeType}
            onSubmit={onBuy}
          />
        )}

        {buyType === "Limit Buy" && (
          <BuyLimitForm
            cash={info.availableCash}
            transactionFee={info.transactionFee}
            feeType={info.feeType}
            onSubmit={onOrder}
          />
        )}
      </Col>
    </CardWrapper>
  );
};

export default BuyOrder;
