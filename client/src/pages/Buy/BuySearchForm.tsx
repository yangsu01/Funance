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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tickerRef.current) {
      onSubmit(tickerRef.current.value);
    }
  };

  console.log(buyInfo);

  return (
    <Row className="d-flex align-items-end">
      <Col md={6} className="mb-3">
        <InfoCard
          title="Game Details"
          infoList={[
            `Available Cash: $${buyInfo.availableCash}`,
            `Fee Type: ${buyInfo.feeType}`,
            `Fee Per Transaction: ${buyInfo.transactionFee * 100}%`,
          ]}
        />
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
