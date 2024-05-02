import React, { useState, useRef } from "react";
import { Button, Form } from "react-bootstrap";

// components
import FormFloatingLabel from "../../components/Forms/FormFloatingLabel";
import CardWrapper from "../../components/UI/CardWrapper";
// utilities
import roundNumber from "../../utils/roundNumber";
// contexts
import { useShowAlert } from "../../contexts/AlertContext";
// types
import { SellInfo } from "../../utils/types";

type Props = {
  info: SellInfo;
  currentPrice: number;
  ticker: string;
  onSubmit: (shares: number, price: number, ticker: string) => void;
};

const SellForm = ({ info, currentPrice, ticker, onSubmit }: Props) => {
  const [shares, setShares] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [transactionFee, setTransactionFee] = useState(0);

  const sharesOwned = info.holdingsInfo[ticker].sharesOwned;
  const averagePrice = info.holdingsInfo[ticker].averagePrice;

  const showAlert = useShowAlert();

  const handleValues = (e: React.ChangeEvent<HTMLInputElement>) => {
    let numShares = parseInt(e.target.value);
    numShares ? numShares : (numShares = 0);

    setShares(numShares);
    if (info.feeType === "Flat Fee") {
      setTotalProfit(
        roundNumber(
          numShares * (currentPrice - averagePrice) - info.transactionFee,
          2
        )
      );
      setTransactionFee(info.transactionFee);
    } else {
      setTotalProfit(
        roundNumber(
          numShares *
            (currentPrice - averagePrice - currentPrice * info.transactionFee),
          2
        )
      );
      setTransactionFee(
        roundNumber(numShares * currentPrice * info.transactionFee, 2)
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shares <= 0 || shares > sharesOwned) {
      showAlert(`You cannot sell ${shares} shares!`, "danger");
      return;
    }
    onSubmit(shares, currentPrice, ticker);
  };

  return (
    <CardWrapper className="d-flex justify-content-center text-center mb-3">
      <Form onSubmit={handleSubmit}>
        <h4>
          Current price of {ticker} is <strong>${currentPrice}</strong>
        </h4>

        <h5>
          You own <strong>{sharesOwned}</strong> shares, (average price{" "}
          <strong>${averagePrice}</strong> per share)
        </h5>

        <div style={{ maxWidth: "300px", margin: "auto" }} className="my-3">
          <FormFloatingLabel
            label="Shares"
            id="shares"
            type="number"
            onChange={handleValues}
          />
          <Button type="submit" variant="success" size="lg" className="w-100">
            Sell
          </Button>
        </div>

        <h4>
          Total Profit: <strong>${totalProfit}</strong> (Less Transaction Fee: $
          {transactionFee})
        </h4>
      </Form>
    </CardWrapper>
  );
};

export default SellForm;
