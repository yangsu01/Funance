import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";

//context
import { useShowAlert } from "../contexts/AlertContext";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoutes = () => {
  const navigate = useNavigate();
  const showAlert = useShowAlert();
  const { userAuthenticated } = useAuth();

  useEffect(() => {
    if (!userAuthenticated) {
      showAlert("You must be logged in to access this page", "warning");
      navigate("/sign-in");
    }
  }, []);

  return <>{userAuthenticated && <Outlet />}</>;
};

export default PrivateRoutes;
