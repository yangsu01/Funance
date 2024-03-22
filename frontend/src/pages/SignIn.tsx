import { useState } from "react";
import api from "../api";

// components
import Alert from "../components/Alert";

const SignIn = () => {
  // alert flashing
  let [alertVisible, setAlertVisible] = useState(false);
  let [alertMessage, setAlertMessage] = useState("");
  let [alertCategory, setAlertCategory] = useState("");

  const closeAlert = () => {
    setAlertVisible(false);
  };

  // form processing
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signInUser = async (e: any) => {
    e.preventDefault();

    console.log("Email:", email);
    console.log("Password:", password);

    try {
      const response = await api.post("/signin-user", {
        email: email,
        password: password,
      });

      console.log("Response:", response); // debug
    } catch (error: any) {
      // console.error("Error:", error.message); // debug
      if (error.response.status === 401) {
        setAlertMessage(error.response.data.error);
        setAlertCategory("danger");
        setAlertVisible(true);
      } else {
        setAlertMessage(error.message);
        setAlertCategory("danger");
        setAlertVisible(true);
      }
    }
  };

  return (
    <>
      {alertVisible && (
        <Alert category={alertCategory} onClose={closeAlert}>
          {alertMessage}
        </Alert>
      )}

      <main className="form-login m-auto mt-5">
        <form>
          <h3 className="display-6 fw-bold text-white">Sign In</h3>

          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="email">Email address</label>
          </div>
          <div className="form-floating mb-3">
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password">Password</label>
          </div>

          <div className="form-check text-start my-3">
            <input type="checkbox" className="form-check-input" value="yes" />
            <label htmlFor="remember" className="form-check-label">
              Remember me
            </label>
          </div>
          <button
            // type="button"
            className="btn btn-success w-100 py-2 mb-3"
            onSubmit={signInUser}
          >
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
