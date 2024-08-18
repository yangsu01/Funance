import { useState, useEffect } from "react";
import { Button, Form } from "react-bootstrap";

// components
import FormFloatingLabel from "../../components/Forms/FormFloatingLabel";
// contexts
import { useShowAlert } from "../../contexts/AlertContext";
// utilities
import roundNumber from "../../utils/roundNumber";
// types
import { OrderTypes } from "../../utils/types";

type Props = {
  cash: number;
  transactionFee: number;
  feeType: string;
  onSubmit: (
    shares: number,
    orderType: OrderTypes,
    expiration: string | null,
    targetPrice: number | null
  ) => void;
};

const BuyLimitForm = ({ cash, transactionFee, feeType, onSubmit }: Props) => {
  const [targetPrice, setTargetPrice] = useState<number | null>(null);
  const [maxShares, setMaxShares] = useState(0);
  const [shares, setShares] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [fee, setFee] = useState(0);
  const [orderExpiration, setOrderExpiration] = useState<string | null>(null);

  const showAlert = useShowAlert();

  // when target price changes, recalculate max shares
  useEffect(() => {
    if (feeType === "Flat Fee" && targetPrice) {
      setMaxShares(Math.floor((cash - transactionFee) / targetPrice));
    } else if (feeType === "Percentage" && targetPrice) {
      setMaxShares(Math.floor(cash / (1 + transactionFee) / targetPrice));
    } else {
      setMaxShares(0);
    }
  }, [targetPrice]);

  // calculating transaction fees
  const handleFees = (e: React.ChangeEvent<HTMLInputElement>) => {
    let numShares = parseInt(e.target.value);
    numShares ? numShares : (numShares = 0);

    setShares(numShares);
    if (feeType === "Flat Fee" && targetPrice) {
      setTotalCost(roundNumber(numShares * targetPrice + transactionFee));
      setFee(transactionFee);
    } else if (feeType === "Percentage" && targetPrice) {
      setTotalCost(roundNumber(numShares * targetPrice * (1 + transactionFee)));
      setFee(roundNumber(numShares * targetPrice * transactionFee));
    }
  };

  // order submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shares <= 0 || shares > maxShares) {
      showAlert("Cannot afford this transaction!", "danger");
      return;
    }
    onSubmit(shares, "limit buy", orderExpiration, targetPrice);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Label>Set target price</Form.Label>
      <FormFloatingLabel
        label="Target Price"
        id="targetPrice"
        type="number"
        onChange={(e) => setTargetPrice(parseFloat(e.target.value))}
      />

      <Form.Label>
        Input share count (<strong>estimated max: {maxShares}</strong>)
      </Form.Label>
      <FormFloatingLabel
        label="Shares"
        id="shares"
        type="number"
        onChange={handleFees}
      />

      <Form.Label>Set order expiration date (optional)</Form.Label>
      <FormFloatingLabel
        required={false}
        label="Expiration Date"
        id="expiration"
        type="date"
        onChange={(e) => setOrderExpiration(e.target.value)}
      />

      <Button type="submit" variant="success" size="lg" className="w-100 mb-3">
        Submit Order
      </Button>

      <h4>
        Estimated Cost*: <strong>${totalCost}</strong>
      </h4>

      <h5>(Estimated Fees: ${fee})</h5>

      <p className="text-muted">
        <small>
          *Limit Buy orders are executed when the stock price reaches the target
          price
        </small>
      </p>
    </Form>
  );
};

export default BuyLimitForm;
