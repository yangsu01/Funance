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
import { BuyInfo } from "../../utils/types";

type Props = {
  info: BuyInfo;
  currentPrice: number;
  ticker: string;
  onSubmit: (shares: number, price: number, ticker: string) => void;
};

const BuyForm = ({ info, currentPrice, ticker, onSubmit }: Props) => {
  const maxSharesRef = useRef(0);

  const [shares, setShares] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [transactionFee, setTransactionFee] = useState(0);

  const showAlert = useShowAlert();

  if (info.feeType === "Flat Fee") {
    maxSharesRef.current = Math.floor(
      (info.availableCash - info.transactionFee) / currentPrice
    );
  } else {
    maxSharesRef.current = Math.floor(
      info.availableCash / (1 + info.transactionFee) / currentPrice
    );
  }

  const handleValues = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value);
    value ? value : (value = 0);

    setShares(value);
    if (info.feeType === "Flat Fee") {
      setTotalCost(roundNumber(value * currentPrice + info.transactionFee, 2));
      setTransactionFee(info.transactionFee);
    } else {
      setTotalCost(
        roundNumber(value * currentPrice * (1 + info.transactionFee), 2)
      );
      setTransactionFee(
        roundNumber(value * currentPrice * info.transactionFee, 2)
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shares <= 0 || shares > maxSharesRef.current) {
      showAlert("Cannot afford this transaction!", "danger");
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
          You can afford: <strong>{maxSharesRef.current}</strong> shares, How
          many do you want to buy?
        </h5>

        <div style={{ maxWidth: "300px", margin: "auto" }} className="my-3">
          <FormFloatingLabel
            label="Shares"
            id="shares"
            type="number"
            onChange={handleValues}
          />
          <Button type="submit" variant="success" size="lg" className="w-100">
            Buy
          </Button>
        </div>

        <h4>
          Total Cost: <strong>${totalCost}</strong> (Transaction Fee: $
          {transactionFee})
        </h4>
      </Form>
    </CardWrapper>
  );
};

export default BuyForm;
