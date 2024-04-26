import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

// bootstrap elements
import { Form, FloatingLabel, Button } from "react-bootstrap";

// utils
import api from "../../utils/api";

// types
import { AlertMessage } from "../../utils/types";

type Props = {
  setToken: (accessToken: string) => void;
  setUserAuthenticated: (authenticated: boolean) => void;
  showAlert: (alertMessage: AlertMessage) => void;
};

const SignUp = ({ setToken, setUserAuthenticated, showAlert }: Props) => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password1: "",
    password2: "",
  });
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // form validation
    if (formData.email.length < 3) {
      showAlert({ alert: "Username too short", alertType: "danger" });

      return;
    } else if (formData.password1 !== formData.password2) {
      showAlert({ alert: "Passwords do not match", alertType: "danger" });

      return;
    } else if (formData.password1.length < 6) {
      showAlert({ alert: "Password too short", alertType: "danger" });

      return;
    }

    // call backend api
    try {
      const response = await api.post("/signup-user", {
        email: formData.email,
        username: formData.username,
        password: formData.password1,
      });
      setToken(response.data.accessToken);
      setUserAuthenticated(true);

      navigate("/", {
        replace: true,
        state: {
          alert: `Welcome ${formData.username}!`,
          alertType: "success",
        },
      });
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        showAlert({ alert: error.response.data.msg, alertType: "danger" });
      } else {
        showAlert({ alert: error.alertMessage, alertType: "danger" });
      }
    }
  };

  return (
    <main className="form-signup m-auto mt-5">
      <h3 className="display-6 fw-bold text-white mb-3">Sign Up</h3>

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
    </main>
  );
};

export default SignUp;
