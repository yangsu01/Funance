import { useState, useEffect } from "react";
import { Button, Form } from "react-bootstrap";

// components
import FormFloatingLabel from "../../components/Forms/FormFloatingLabel";
import ChangeColors from "../../components/UI/ChangeColors";
// contexts
import { useShowAlert } from "../../contexts/AlertContext";
// utilities
import roundNumber from "../../utils/roundNumber";
// types
import { OrderTypes } from "../../utils/types";

type Props = {
  transactionFee: number;
  feeType: string;
  orderType: OrderTypes;
  averagePrice: number;
  sharesOwned: number;
  onSubmit: (
    shares: number,
    orderType: OrderTypes,
    expiration: string | null,
    targetPrice: number | null
  ) => void;
};

const SellOrderForm = ({
  transactionFee,
  feeType,
  orderType,
  sharesOwned,
  averagePrice,
  onSubmit,
}: Props) => {
  const [targetPrice, setTargetPrice] = useState<number | null>(null);
  const [shares, setShares] = useState(0);
  const [totalProfit, setTotalProfit] = useState<number>(0);
  const [fee, setFee] = useState(0);
  const [orderExpiration, setOrderExpiration] = useState<string | null>(null);

  const showAlert = useShowAlert();

  // when target price or shares change, recalculate estimated profit/loss
  useEffect(() => {
    if (targetPrice && shares) {
      if (feeType === "Flat Fee") {
        setTotalProfit(
          roundNumber(shares * (targetPrice - averagePrice) - transactionFee)
        );
        setFee(transactionFee);
      } else {
        setTotalProfit(
          roundNumber(
            shares * (targetPrice - averagePrice) -
              shares * targetPrice * transactionFee
          )
        );
        setFee(roundNumber(shares * targetPrice * transactionFee));
      }
    }
  }, [targetPrice, shares]);

  // order submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (targetPrice === null || targetPrice <= 0) {
      showAlert("Invalid Target Price!", "danger");
      return;
    } else if (shares <= 0 || shares > sharesOwned) {
      showAlert("Invalid Shares Count!", "danger");
      return;
    } else {
      onSubmit(shares, orderType, orderExpiration, targetPrice);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Label>Set target sell price</Form.Label>
      <FormFloatingLabel
        label="Target Price"
        id="targetPrice"
        type="number"
        step="any"
        onChange={(e) => setTargetPrice(parseFloat(e.target.value))}
      />

      <Form.Label>
        Input amount to sell (<strong>you own: {sharesOwned} shares</strong>)
      </Form.Label>
      <FormFloatingLabel
        label="Shares"
        id="shares"
        type="number"
        onChange={(e) => setShares(parseInt(e.target.value))}
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
        Estimated Profit/Loss*:{" "}
        <ChangeColors num={totalProfit} percentage={false} />
      </h4>

      <h5>(Estimated Fees: ${fee})</h5>

      {orderType === "limit sell" ? (
        <p className="text-muted">
          <small>
            *Limit Sell orders are executed when the stock price is above the
            target price
          </small>
        </p>
      ) : (
        <p className="text-muted">
          <small>
            *Stop-Loss orders are executed when the stock price falls below the
            target price
          </small>
        </p>
      )}
    </Form>
  );
};

export default SellOrderForm;
