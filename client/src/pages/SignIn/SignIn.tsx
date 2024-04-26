import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, FloatingLabel, Button } from "react-bootstrap";

import api from "../../utils/api";

// types
import { AlertMessage } from "../../utils/types";

type Props = {
  setToken: (accessToken: string) => void;
  setUserAuthenticated: (authenticated: boolean) => void;
  showAlert: (alertMessage: AlertMessage) => void;
};

const SignIn = ({ setToken, setUserAuthenticated, showAlert }: Props) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // call backend api
    try {
      const response = await api.post("/signin-user", {
        email: formData.email,
        password: formData.password,
      });
      setToken(response.data.accessToken);
      setUserAuthenticated(true);

      navigate("/", {
        replace: true,
        state: {
          alert: `Welcome back ${response.data.username}!`,
          alertType: "success",
        },
      });
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        showAlert({ alert: error.response.data.msg, alertType: "danger" });
      } else {
        showAlert({ alert: error.response.data.msg, alertType: "danger" });
      }
    }
  };

  return (
    <main className="form-login m-auto mt-5">
      <h3 className="display-6 fw-bold text-white mb-3">Sign In</h3>

      <Form onSubmit={onSubmit}>
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
    </main>
  );
};

export default SignIn;
