import React, { useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";

// components
import InfoCard from "../../components/UI/InfoCard";
import FormFloatingLabel from "../../components/Forms/FormFloatingLabel";
import CardWrapper from "../../components/UI/CardWrapper";
// types
import { BuyInfo } from "../../utils/types";

type Props = {
  buyInfo: BuyInfo;
  onSubmit: (ticker: string) => void;
};

const BuySearchForm = ({ buyInfo, onSubmit }: Props) => {
  const [ticker, setTicker] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(ticker);
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
            <FormFloatingLabel
              inputLabel="Enter ticker of the stock you want to buy:"
              label="Ticker"
              type="text"
              id="ticker"
              onChange={(e) => setTicker(e.target.value)}
            />
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
