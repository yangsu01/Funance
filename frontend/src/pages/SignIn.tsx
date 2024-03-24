import { useState } from "react";
import api from "../utils/api";

// components
import Alert from "../components/Alert";
import FormInput from "../components/FormInput";

interface Props {
  setToken: (accessToken: string) => void;
  setUserAuthenticated: (authenticated: boolean) => void;
}

const SignIn = ({ setToken, setUserAuthenticated }: Props) => {
  // alert flashing
  let [alertVisible, setAlertVisible] = useState(false);
  let [alertMessage, setAlertMessage] = useState("");

  const closeAlert = () => {
    setAlertVisible(false);
  };

  // form processing
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const signInUser = async (e: React.FormEvent) => {
    e.preventDefault();

    // call backend api
    try {
      const response = await api.post("/signin-user", {
        email: formData.email,
        password: formData.password,
      });
      setToken(response.data.accessToken);
      setUserAuthenticated(true);

      window.location.href = "/";
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
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

      <main className="form-login m-auto mt-5">
        <form onSubmit={signInUser}>
          <h3 className="display-6 fw-bold text-white">Sign In</h3>

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
            id="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          <button type="submit" className="btn btn-success w-100 py-2 mb-3">
            Sign in
          </button>
        </form>

        <div className="text-center">
          <a href="/sign-up">Don't have an account?</a>
        </div>
      </main>
    </>
  );
};

export default SignIn;
