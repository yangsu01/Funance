import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";

// bootstrap elements
import { Form, FloatingLabel, Button } from "react-bootstrap";

type Props = {
  setToken: (accessToken: string) => void;
  setUserAuthenticated: (authenticated: boolean) => void;
  showAlert: (message: string, type: "success" | "danger" | "warning") => void;
};

const SignUp = (props: Props) => {
  const { setToken, setUserAuthenticated, showAlert } = props;
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
      showAlert("Username too short", "danger");

      return;
    } else if (formData.password1 !== formData.password2) {
      showAlert("Passwords do not match", "danger");

      return;
    } else if (formData.password1.length < 6) {
      showAlert("Password too short", "danger");

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
        showAlert(error.response.data.msg, "danger");
      } else {
        showAlert(error.alertMessage, "danger");
      }
    }
  };

  return (
    <main className="form-signup m-auto mt-5">
      <h3 className="display-6 fw-bold text-white mb-3">Sign Up</h3>

      <Form onSubmit={onSubmit}>
        <FloatingLabel controlId="email" label="Email address" className="mb-3">
          <Form.Control
            required
            type="email"
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </FloatingLabel>
        <FloatingLabel controlId="username" label="Username" className="mb-3">
          <Form.Control
            required
            type="text"
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />
        </FloatingLabel>
        <FloatingLabel controlId="password1" label="Password" className="mb-3">
          <Form.Control
            required
            type="password"
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
