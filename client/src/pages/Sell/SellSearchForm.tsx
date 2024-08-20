import React, { useRef } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";

// components
import InfoCard from "../../components/UI/InfoCard";
import CardWrapper from "../../components/UI/CardWrapper";
// types
import { SellInfo } from "../../utils/types";

type Props = {
  sellInfo: SellInfo;
  onSubmit: (ticker: string) => void;
};

const SellSearchForm = ({ sellInfo, onSubmit }: Props) => {
  const tickerRef = useRef<HTMLSelectElement | null>(null);
  const transactionFee =
    sellInfo.feeType === "Flat Fee"
      ? `$${sellInfo.transactionFee}`
      : `${sellInfo.transactionFee * 100}%`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (tickerRef.current) {
      tickerRef.current.value === "Select Ticker"
        ? null
        : onSubmit(tickerRef.current.value);
    }
  };

  return (
    <Row className="d-flex align-items-end">
      <Col md={6} className="mb-3">
        <InfoCard
          title="Game Details"
          infoList={[
            `Available Cash: $${sellInfo.availableCash}`,
            `Fee Type: ${sellInfo.feeType}`,
            `Fee Per Transaction: ${transactionFee}`,
          ]}
        />
      </Col>
      <Col md={6} className="mb-3">
        <CardWrapper>
          <Form onSubmit={handleSubmit}>
            <Form.Label className="mb-3">
              Select the ticker of the stock you want to sell:
            </Form.Label>
            <Form.Select
              ref={tickerRef}
              size="lg"
              className="mb-3"
              aria-label="ticker select"
            >
              <option key="select">Select Ticker</option>
              {sellInfo.holdings &&
                sellInfo.holdings.map((holding) => (
                  <option key={holding}>{holding}</option>
                ))}
            </Form.Select>
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

export default SellSearchForm;
