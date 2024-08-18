import { useState, useRef } from "react";
import { Button, Form } from "react-bootstrap";

// components
import FormFloatingLabel from "../../components/Forms/FormFloatingLabel";
// contexts
import { useShowAlert } from "../../contexts/AlertContext";
// utilities
import roundNumber from "../../utils/roundNumber";

type Props = {
  currentPrice: number;
  cash: number;
  transactionFee: number;
  feeType: string;
  onSubmit: (shares: number) => void;
};

const BuyMarketForm = ({
  currentPrice,
  cash,
  transactionFee,
  feeType,
  onSubmit,
}: Props) => {
  const maxSharesRef = useRef(0);

  const [shares, setShares] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [fee, setFee] = useState(0);

  const showAlert = useShowAlert();

  // calculate maximum number of shares user can afford
  if (feeType === "Flat Fee") {
    maxSharesRef.current = Math.floor((cash - transactionFee) / currentPrice);
  } else {
    maxSharesRef.current = Math.floor(
      cash / (1 + transactionFee) / currentPrice
    );
  }

  const handleFees = (e: React.ChangeEvent<HTMLInputElement>) => {
    let numShares = parseInt(e.target.value);
    numShares ? numShares : (numShares = 0);

    setShares(numShares);
    if (feeType === "Flat Fee") {
      setTotalCost(roundNumber(numShares * currentPrice + transactionFee));
      setFee(transactionFee);
    } else {
      setTotalCost(
        roundNumber(numShares * currentPrice * (1 + transactionFee))
      );
      setFee(roundNumber(numShares * currentPrice * transactionFee));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shares <= 0 || shares > maxSharesRef.current) {
      showAlert("Cannot afford this transaction!", "danger");
      return;
    }
    onSubmit(shares);
  };
  return (
    <Form onSubmit={handleSubmit}>
      <Form.Label>
        Input share count (
        <strong>estimated max*: {maxSharesRef.current}</strong>)
      </Form.Label>
      <FormFloatingLabel
        label="Shares"
        id="shares"
        type="number"
        onChange={handleFees}
      />
      <Button type="submit" variant="success" size="lg" className="w-100 mb-3">
        Buy
      </Button>

      <h4>
        Estimated Cost*: <strong>${totalCost}</strong>
      </h4>

      <h5>(Estimated Fees: ${fee})</h5>

      <p className="text-muted">* Costs may vary based on market price</p>
    </Form>
  );
};

export default BuyMarketForm;
