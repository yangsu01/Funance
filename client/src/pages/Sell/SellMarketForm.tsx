import { useState } from "react";
import { Button, Form } from "react-bootstrap";

// components
import FormFloatingLabel from "../../components/Forms/FormFloatingLabel";
import ChangeColors from "../../components/UI/ChangeColors";
// contexts
import { useShowAlert } from "../../contexts/AlertContext";
// utilities
import roundNumber from "../../utils/roundNumber";

type Props = {
  currentPrice: number;
  transactionFee: number;
  feeType: string;
  averagePrice: number;
  sharesOwned: number;
  onSubmit: (shares: number) => void;
};

const SellMarketForm = ({
  currentPrice,
  transactionFee,
  feeType,
  averagePrice,
  sharesOwned,
  onSubmit,
}: Props) => {
  const [shares, setShares] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [fee, setFee] = useState(0);

  const showAlert = useShowAlert();

  const handleFees = (e: React.ChangeEvent<HTMLInputElement>) => {
    let numShares = parseInt(e.target.value);
    numShares ? numShares : (numShares = 0);

    setShares(numShares);
    if (feeType === "Flat Fee") {
      setTotalProfit(
        roundNumber(numShares * (currentPrice - averagePrice) - transactionFee)
      );
      setFee(transactionFee);
    } else {
      setTotalProfit(
        roundNumber(
          numShares * (currentPrice - averagePrice) -
            numShares * currentPrice * transactionFee
        )
      );
      setFee(roundNumber(numShares * currentPrice * transactionFee));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shares <= 0 || shares > sharesOwned) {
      showAlert("Invalid Shares Count!", "danger");
      return;
    }
    onSubmit(shares);
  };
  return (
    <Form onSubmit={handleSubmit}>
      <Form.Label>
        Input amount to sell (<strong>you own: {sharesOwned} shares</strong>)
      </Form.Label>
      <FormFloatingLabel
        label="Shares"
        id="shares"
        type="number"
        onChange={handleFees}
      />
      <Button type="submit" variant="success" size="lg" className="w-100 mb-3">
        Sell
      </Button>

      <h4>
        Net Profit*: <ChangeColors num={totalProfit} percentage={false} />
        <strong></strong>
      </h4>

      <h5>(Estimated Fees: ${fee})</h5>

      <p className="text-muted">
        * Prices may differ depending on market price
      </p>
    </Form>
  );
};

export default SellMarketForm;
