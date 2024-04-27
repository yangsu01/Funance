import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Form, FloatingLabel, Button } from "react-bootstrap";

import { SignInFormData } from "../../utils/types";

type Props = {
  onSubmit: (formData: SignInFormData) => void;
};

const SignInForm: React.FC<Props> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<SignInFormData>(
    {} as SignInFormData
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
        <FloatingLabel controlId="password" label="Password" className="mb-3">
          <Form.Control
            required
            type="password"
            placeholder="Enter password"
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        </FloatingLabel>
        <Button variant="success" type="submit" className="btn-lg w-100 mb-3">
          Sign In
        </Button>
      </Form>
      <div className="text-center">
        <Link replace to="/sign-up">
          Don't have an account?
        </Link>
      </div>
    </>
  );
};

export default SignInForm;
