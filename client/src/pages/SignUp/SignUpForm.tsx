import React, { useState } from "react";
import { Form, Button, FloatingLabel } from "react-bootstrap";
import { Link } from "react-router-dom";

import { SignUpFormData } from "../../utils/types";

type Props = {
  onSubmit: (formData: SignUpFormData) => void;
};

const SignUpForm: React.FC<Props> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<SignUpFormData>(
    {} as SignUpFormData
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <FloatingLabel controlId="email" label="Email" className="mb-3">
          <Form.Control
            required
            type="email"
            placeholder="Enter email"
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </FloatingLabel>
        <FloatingLabel controlId="username" label="Username" className="mb-3">
          <Form.Control
            required
            type="text"
            placeholder="Enter username"
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />
        </FloatingLabel>
        <FloatingLabel controlId="password1" label="Password" className="mb-3">
          <Form.Control
            required
            type="password"
            placeholder="Enter password"
            onChange={(e) =>
              setFormData({ ...formData, password1: e.target.value })
            }
          />
        </FloatingLabel>
        <FloatingLabel
          controlId="password2"
          label="Confirm Password"
          className="mb-3"
        >
          <Form.Control
            required
            type="password"
            placeholder="Confirm password"
            onChange={(e) =>
              setFormData({ ...formData, password2: e.target.value })
            }
          />
        </FloatingLabel>
        <Button variant="success" type="submit" className="btn-lg w-100 mb-3">
          Create Account
        </Button>
      </Form>

      <div className="text-center">
        <Link replace to="/sign-in">
          Already have an account?
        </Link>
      </div>
    </>
  );
};

export default SignUpForm;
