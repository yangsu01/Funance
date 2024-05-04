import { useNavigate } from "react-router-dom";

// components
import SignUpForm from "./SignUpForm";
// hooks
import usePost from "../../hooks/usePost";
import useSignUp from "./useSignUp";
// contexts
import { useShowAlert } from "../../contexts/AlertContext";
import { useSaveAuth } from "../../contexts/AuthContext";
// types
import { SignUpFormData } from "../../utils/types";

const SignUp = () => {
  const { postData } = usePost();
  const navigate = useNavigate();
  const showAlert = useShowAlert();
  const saveToken = useSaveAuth();

  const onSubmit = async (formData: SignUpFormData) => {
    const response = useSignUp(formData);

    if (response.error) {
      showAlert(response.error, "danger");
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
        showAlert(res.msg, "danger");
      } else {
        saveToken(res.data);
        showAlert(res.msg, "success");
        navigate("/", { replace: true });
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
