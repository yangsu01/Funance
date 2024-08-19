import { useState } from "react";
import { Dropdown, DropdownButton, Col } from "react-bootstrap";

// components
import CardWrapper from "../../components/UI/CardWrapper";
import ChangeColors from "../../components/UI/ChangeColors";
import SellMarketForm from "./SellMarketForm";
import SellOrderForm from "./SellOrderForm";
// types
import { SellInfo, OrderTypes } from "../../utils/types";
// utils
import roundNumber from "../../utils/roundNumber";

type Props = {
  info: SellInfo;
  currentPrice: number;
  dayChange: number;
  ticker: string;
  marketClosed: boolean;
  nextMarketDate: string;
  sharesOwned: number;
  averagePrice: number;
  onSell: (shares: number) => void;
  onOrder: (
    shares: number,
    orderType: OrderTypes,
    expiration: string | null,
    targetPrice: number | null
  ) => void;
};

const SellOrder = ({
  info,
  currentPrice,
  dayChange,
  ticker,
  marketClosed,
  nextMarketDate,
  sharesOwned,
  averagePrice,
  onSell,
  onOrder,
}: Props) => {
  const [sellType, setSellType] = useState<OrderTypes>("market sell");

  const handleOrderSelect = (eventKey: string | null) => {
    if (eventKey) {
      setSellType(eventKey as OrderTypes);
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

        <h4 className="text-center">
          <strong>${currentPrice}</strong> (
          <ChangeColors num={dayChange} percentage={true} /> Past Day)
        </h4>

        <h5 className="text-center mb-4">
          Average price: ${averagePrice} (
          <ChangeColors
            num={roundNumber(
              ((currentPrice - averagePrice) / averagePrice) * 100
            )}
            percentage={true}
          />
          )
        </h5>

        <DropdownButton
          id="order-selector"
          title={`${ticker}: ${sellType}`}
          variant="outline-light"
          className="mb-4 text-center"
          onSelect={handleOrderSelect}
        >
          <Dropdown.Item eventKey="market sell">Market Sell</Dropdown.Item>
          <Dropdown.Item eventKey="limit sell">Limit Sell</Dropdown.Item>
          <Dropdown.Item eventKey="stop-loss">Stop-Loss</Dropdown.Item>
        </DropdownButton>

        {sellType === "market sell" ? (
          <SellMarketForm
            currentPrice={currentPrice}
            transactionFee={info.transactionFee}
            feeType={info.feeType}
            averagePrice={averagePrice}
            sharesOwned={sharesOwned}
            onSubmit={onSell}
          />
        ) : (
          <SellOrderForm
            transactionFee={info.transactionFee}
            feeType={info.feeType}
            orderType={sellType}
            averagePrice={averagePrice}
            sharesOwned={sharesOwned}
            onSubmit={onOrder}
          />
        )}
      </Col>
    </CardWrapper>
  );
};

export default SellOrder;
