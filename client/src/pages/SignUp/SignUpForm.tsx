import { useRef } from "react";
import { Form, Button, FloatingLabel } from "react-bootstrap";
import { Link } from "react-router-dom";

// types
import { SignUpFormData } from "../../utils/types";

type Props = {
  onSubmit: (formData: SignUpFormData) => void;
};

const SignUpForm = ({ onSubmit }: Props) => {
  const emailRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const password1Ref = useRef<HTMLInputElement>(null);
  const password2Ref = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      emailRef.current &&
      usernameRef.current &&
      password1Ref.current &&
      password2Ref.current
    ) {
      onSubmit({
        email: emailRef.current.value,
        username: usernameRef.current.value,
        password1: password1Ref.current.value,
        password2: password2Ref.current.value,
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
        <FloatingLabel controlId="username" label="Username" className="mb-3">
          <Form.Control
            required
            type="text"
            placeholder="Enter username"
            ref={usernameRef}
          />
        </FloatingLabel>
        <FloatingLabel controlId="password1" label="Password" className="mb-3">
          <Form.Control
            required
            type="password"
            placeholder="Enter password"
            ref={password1Ref}
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
            ref={password2Ref}
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
