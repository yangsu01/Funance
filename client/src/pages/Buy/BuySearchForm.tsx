import React, { useRef } from "react";
import { Row, Col, Form, Button, FloatingLabel } from "react-bootstrap";

// components
import InfoCard from "../../components/UI/InfoCard";
import CardWrapper from "../../components/UI/CardWrapper";
// types
import { BuyInfo } from "../../utils/types";

type Props = {
  buyInfo: BuyInfo;
  onSubmit: (ticker: string) => void;
};

const BuySearchForm = ({ buyInfo, onSubmit }: Props) => {
  const tickerRef = useRef<HTMLInputElement>(null);
  const transactionFee =
    buyInfo.feeType === "Flat Fee"
      ? `$${buyInfo.transactionFee}`
      : `${buyInfo.transactionFee * 100}%`;
  let detailsContent: string[] = [];

  if (buyInfo.gameStatus === "Not Started") {
    detailsContent = [
      `Game Start Date: ${buyInfo.startDate}`,
      `Available Cash: $${buyInfo.availableCash}`,
      `Fee Type: ${buyInfo.feeType}`,
      `Fee Per Transaction: ${transactionFee}`,
    ];
  } else {
    detailsContent = [
      `Available Cash: $${buyInfo.availableCash}`,
      `Fee Type: ${buyInfo.feeType}`,
      `Fee Per Transaction: ${transactionFee}`,
    ];
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tickerRef.current) {
      onSubmit(tickerRef.current.value);
    }
  };

  return (
    <Row className="d-flex align-items-end">
      <Col md={6} className="mb-3">
        <InfoCard title="Game Details" infoList={detailsContent} />
      </Col>
      <Col md={6} className="mb-3">
        <CardWrapper>
          <Form onSubmit={handleSubmit}>
            <Form.Label className="mb-3">
              Enter ticker of the stock you want to buy:
            </Form.Label>
            <FloatingLabel controlId="ticker" label="Ticker" className="mb-3">
              <Form.Control
                required
                type="text"
                placeholder="Ticker"
                ref={tickerRef}
              />
            </FloatingLabel>
            <div className="d-flex justify-content-end">
              <Button
                type="submit"
                variant="success"
                size="lg"
                style={{ minWidth: "100px" }}
              >
                Search
              </Button>
            </div>
          </Form>
        </CardWrapper>
      </Col>
    </Row>
  );
};

export default BuySearchForm;
