import { useState } from "react";
import api from "../utils/api";

// components
import Alert from "../components/Alert";
import FormInput from "../components/FormInput";

interface Props {
  setToken: (accessToken: string) => void;
  setUserAuthenticated: (authenticated: boolean) => void;
}

const SignUp = ({ setToken, setUserAuthenticated }: Props) => {
  // alert flashing
  let [alertVisible, setAlertVisible] = useState(false);
  let [alertMessage, setAlertMessage] = useState("");

  const closeAlert = () => {
    setAlertVisible(false);
  };

  // form processing
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password1: "",
    password2: "",
  });

  const signUpUser = async (e: React.FormEvent) => {
    e.preventDefault();

    // form validation
    if (formData.email.length < 3) {
      setAlertMessage("Username too short");
      setAlertVisible(true);
      return;
    } else if (formData.password1 !== formData.password2) {
      setAlertMessage("Passwords do not match");
      setAlertVisible(true);
      return;
    } else if (formData.password1.length < 6) {
      setAlertMessage("Password too short");
      setAlertVisible(true);
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

      window.location.href = "/";
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        setAlertMessage(error.response.data.msg);
        setAlertVisible(true);
      } else {
        setAlertMessage(error.message);
        setAlertVisible(true);
      }
    }
  };

  return (
    <>
      {alertVisible && (
        <Alert category="danger" onClose={closeAlert}>
          {alertMessage}
        </Alert>
      )}

      <main className="form-signup m-auto mt-5">
        <form onSubmit={signUpUser}>
          <h3 className="display-6 fw-bold text-white">Sign Up</h3>

          <FormInput
            id="email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <FormInput
            id="username"
            label="Username"
            type="text"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />

          <FormInput
            id="password1"
            label="Password"
            type="password"
            value={formData.password1}
            onChange={(e) =>
              setFormData({ ...formData, password1: e.target.value })
            }
          />

          <FormInput
            id="password2"
            label="Confirm Password"
            type="password"
            value={formData.password2}
            onChange={(e) =>
              setFormData({ ...formData, password2: e.target.value })
            }
          />

          <button type="submit" className="btn btn-success w-100 py-2 mb-3">
            Sign Up
          </button>
        </form>

        <div className="text-center">
          <a href="/sign-in">Already have an account?</a>
        </div>
      </main>
    </>
  );
};

export default SignUp;
