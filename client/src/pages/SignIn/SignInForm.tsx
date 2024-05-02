import { useRef } from "react";
import { Link } from "react-router-dom";
import { Form, FloatingLabel, Button } from "react-bootstrap";

// types
import { SignInFormData } from "../../utils/types";

type Props = {
  onSubmit: (formData: SignInFormData) => void;
};

const SignInForm = ({ onSubmit }: Props) => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailRef.current && passwordRef.current) {
      onSubmit({
        email: emailRef.current.value,
        password: passwordRef.current.value,
      });
    }
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <FloatingLabel controlId="email" label="Email" className="mb-3">
          <Form.Control
            required
            type="email"
            placeholder="Enter email"
            ref={emailRef}
          />
        </FloatingLabel>
        <FloatingLabel controlId="password" label="Password" className="mb-3">
          <Form.Control
            required
            type="password"
            placeholder="Enter password"
            ref={passwordRef}
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
