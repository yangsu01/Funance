import { useNavigate } from "react-router-dom";

// components
import SignInForm from "./SignInForm";
// hooks
import usePost from "../../hooks/usePost";
// contexts
import { useShowAlert } from "../../contexts/AlertContext";
import { useSaveAuth } from "../../contexts/AuthContext";
// types
import { SignInFormData } from "../../utils/types";

const SignIn = () => {
  const { postData } = usePost();
  const navigate = useNavigate();
  const showAlert = useShowAlert();
  const saveToken = useSaveAuth();

  const handleSubmit = async (formData: SignInFormData) => {
    const post = async () => {
      return await postData("/signin-user", {
        email: formData.email,
        password: formData.password,
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
    <main className="form-login m-auto mt-5">
      <h3 className="display-6 fw-bold text-white mb-3">Sign In</h3>
      <SignInForm onSubmit={handleSubmit} />
    </main>
  );
};

export default SignIn;
