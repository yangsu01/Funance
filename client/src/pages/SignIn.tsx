import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, FloatingLabel, Button } from "react-bootstrap";
import api from "../utils/api";

interface Props {
  setToken: (accessToken: string) => void;
  setUserAuthenticated: (authenticated: boolean) => void;
  showAlert: (message: string, type: "success" | "danger" | "warning") => void;
}

const SignIn = ({ setToken, setUserAuthenticated, showAlert }: Props) => {
  const navigate = useNavigate();

  // form processing
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

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
        showAlert(error.response.data.msg, "danger");
      } else {
        showAlert(error.response.data.msg, "danger");
      }
    }
  };

  return (
    <main className="form-login m-auto mt-5">
      <h3 className="display-6 fw-bold text-white mb-3">Sign In</h3>

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
        <FloatingLabel
          controlId="password"
          label="Confirm Password"
          className="mb-3"
        >
          <Form.Control
            required
            type="password"
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
