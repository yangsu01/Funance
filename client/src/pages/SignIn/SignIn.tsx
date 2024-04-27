import React from "react";
import { useNavigate } from "react-router-dom";

// components
import SignInForm from "./SignInForm";

// hooks
import usePost from "../../hooks/usePost";

// types
import { AlertMessage, SignInFormData } from "../../utils/types";

type Props = {
  authenticateUser: (token: string) => void;
  showAlert: (alertMessage: AlertMessage) => void;
};

const SignIn: React.FC<Props> = ({ authenticateUser, showAlert }) => {
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
      if (res.status === "error") {
        showAlert({ alert: res.msg, alertType: "danger" });
      } else {
        authenticateUser(res.data);
        navigate("/", {
          replace: true,
          state: {
            alert: res.msg,
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
