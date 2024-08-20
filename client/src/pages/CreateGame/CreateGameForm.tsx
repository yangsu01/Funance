import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Form,
  FloatingLabel,
  Row,
  Col,
  InputGroup,
  Container,
} from "react-bootstrap";

// types
import { CreateGameFormData } from "../../utils/types";

type Props = {
  onSubmit: (formData: CreateGameFormData) => void;
};

const CreateGameForm = ({ onSubmit }: Props) => {
  const [formData, setFormData] = useState<CreateGameFormData>(
    {} as CreateGameFormData
  );
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleCancel = () => {
    navigate(-1);
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (formData.feeType) {
      setFormData({ ...formData, transactionFee: 0 });
    }
  }, [formData.feeType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit(formData);
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <Container className="mb-4">
          {/* game name and password */}
          <Row>
            <Col md={6} className="mb-4">
              <Form.Label>Enter unique game name</Form.Label>
              <FloatingLabel controlId="name" label="Game Name">
                <Form.Control
                  required
                  type="text"
                  placeholder="Enter game name"
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </FloatingLabel>
            </Col>
            <Col md={6} className="mb-4">
              <Form.Label>Enter password (optional)</Form.Label>
              <InputGroup>
                <FloatingLabel controlId="password" label="Password">
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </FloatingLabel>
                <InputGroup.Checkbox
                  aria-label="show password"
                  onClick={handleTogglePassword}
                />
              </InputGroup>
            </Col>
          </Row>

          {/* start and end dates */}
          <Row>
            <Col md={6} className="mb-4">
              <Form.Label>Enter game start date</Form.Label>
              <FloatingLabel controlId="start date" label="Start Date">
                <Form.Control
                  required
                  type="date"
                  placeholder="Enter start date"
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </FloatingLabel>
            </Col>
            <Col md={6} className="mb-4">
              <Form.Label>Enter game end date (optional)</Form.Label>
              <FloatingLabel controlId="end date" label="End Date">
                <Form.Control
                  type="date"
                  placeholder="Enter end date"
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </FloatingLabel>
            </Col>
          </Row>

          {/* starting cash and transaction fee */}
          <Row>
            <Col md={4} className="mb-4">
              <Form.Label>Enter starting cash</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <FloatingLabel controlId="starting cash" label="Starting Cash">
                  <Form.Control
                    required
                    type="number"
                    placeholder="10000"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        startingCash: Number(e.target.value),
                      })
                    }
                  />
                </FloatingLabel>
              </InputGroup>
            </Col>
            <Col md={4} className="mb-4">
              <Form.Label>Select transaction fee type</Form.Label>
              <FloatingLabel controlId="fee type" label="Fee Type">
                <Form.Select
                  aria-label="feeType select"
                  onChange={(e) =>
                    setFormData({ ...formData, feeType: e.target.value })
                  }
                >
                  <option value="">No Fee</option>
                  <option value="Flat Fee">Flat Fee</option>
                  <option value="Percentage">Percentage</option>
                </Form.Select>
              </FloatingLabel>
            </Col>
            {formData.feeType && (
              <Col md={4} className="mb-4">
                <Form.Label>Enter transaction fee</Form.Label>
                <InputGroup>
                  {formData.feeType === "Flat Fee" && (
                    <InputGroup.Text>$</InputGroup.Text>
                  )}
                  <FloatingLabel
                    controlId="transaction fee"
                    label="Transaction Fee"
                  >
                    <Form.Control
                      type="number"
                      step="any"
                      placeholder="0"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          transactionFee: parseFloat(e.target.value),
                        })
                      }
                    />
                  </FloatingLabel>
                  {formData.feeType === "Percentage" && (
                    <InputGroup.Text>%</InputGroup.Text>
                  )}
                </InputGroup>
              </Col>
            )}
          </Row>
        </Container>

        <Container className="d-flex justify-content-end">
          <Button
            variant="outline-light"
            size="lg"
            className="me-3"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button type="submit" variant="success" size="lg">
            Create Game
          </Button>
        </Container>
      </Form>
    </>
  );
};

export default CreateGameForm;
