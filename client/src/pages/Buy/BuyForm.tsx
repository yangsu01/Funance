import React from "react";
import { Row, Card, Form } from "react-bootstrap";
import { BuyInfo } from "../../utils/types";

type Props = {
  buyInfo: BuyInfo;
  onSubmit: (ticker: string) => void;
};

const BuyForm = () => {
  return (
    <Form onSubmit={handleSubmit}>
      <Modal.Body>
        <Form.Label className="mb-3">{content}</Form.Label>
        <FloatingLabel
          controlId="password"
          label="Game Password"
          className="mb-3"
        >
          <Form.Control
            required
            type="password"
            placeholder="Enter game password"
            onChange={(e) => setFormData(e.target.value)}
          />
        </FloatingLabel>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-light" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="success">
          {submitName}
        </Button>
      </Modal.Footer>
    </Form>
  );
};

export default BuyForm;
