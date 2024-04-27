import React from "react";
import { useNavigate } from "react-router-dom";

import SignUpForm from "./SignUpForm";

// hooks
import usePost from "../../hooks/usePost";
import useSignUp from "./useSignUp";

// types
import { AlertMessage, SignUpFormData } from "../../utils/types";

type Props = {
  authenticateUser: (token: string) => void;
  showAlert: (alertMessage: AlertMessage) => void;
};

const SignUp: React.FC<Props> = ({ authenticateUser, showAlert }) => {
  const { postData } = usePost();
  const navigate = useNavigate();

  const onSubmit = async (formData: SignUpFormData) => {
    const response = useSignUp(formData);

    if (response.error) {
      showAlert({ alert: response.error, alertType: "danger" });
      return;
    }

    const post = async () => {
      return await postData("/signup-user", {
        email: formData.email,
        username: formData.username,
        password: formData.password1,
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
    <main className="form-signup m-auto mt-5">
      <h3 className="display-6 fw-bold text-white mb-3">Sign Up</h3>

      <SignUpForm onSubmit={onSubmit} />
    </main>
  );
};

export default SignUp;
