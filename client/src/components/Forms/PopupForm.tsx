import React, { useState } from "react";
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";

type Props = {
  show: boolean;
  onClose: () => void;
  onSubmit: (name: string, input: string) => void;
  name: string;
  content: string;
  submitName: string;
};

const PopupForm: React.FC<Props> = ({
  show,
  onClose,
  onSubmit,
  name,
  content,
  submitName,
}) => {
  const [formData, setFormData] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name, formData.trim());
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>{name}</Modal.Title>
      </Modal.Header>
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
    </Modal>
  );
};

export default PopupForm;
