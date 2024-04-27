import React from "react";
import { useNavigate } from "react-router-dom";

import SignInForm from "./SignInForm";

// hooks
import usePost from "../../hooks/usePost";

// types
import { AlertMessage, SignInFormData } from "../../utils/types";

type Props = {
  setToken: (accessToken: string) => void;
  setUserAuthenticated: (authenticated: boolean) => void;
  showAlert: (alertMessage: AlertMessage) => void;
};

const SignIn: React.FC<Props> = ({
  setToken,
  setUserAuthenticated,
  showAlert,
}) => {
  const { postData } = usePost();
  const navigate = useNavigate();

  const onSubmit = async (formData: SignInFormData) => {
    const post = async () => {
      return await postData("/signin-user", {
        email: formData.email,
        password: formData.password,
      });
    };
    post().then((res) => {
      // if error is thrown
      if (res && res.error) {
        showAlert({ alert: res.error, alertType: "danger" });

        // if response is returned
      } else if (res && res.response && res.response.data) {
        setToken(res.response.data);
        setUserAuthenticated(true);
        navigate("/", {
          replace: true,
          state: {
            alert: res.response.msg,
            alertType: "success",
          },
        });
      }
    });
  };

  return (
    <main className="form-login m-auto mt-5">
      <h3 className="display-6 fw-bold text-white mb-3">Sign In</h3>

      <SignInForm onSubmit={onSubmit} />
    </main>
  );
};

export default SignIn;
