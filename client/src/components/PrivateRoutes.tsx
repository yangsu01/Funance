import { useNavigate, Outlet } from "react-router-dom";

//context
import { useShowAlert } from "../contexts/AlertContext";

type Props = {
  userAuthenticated: boolean;
};

const PrivateRoutes = ({ userAuthenticated }: Props) => {
  const navigate = useNavigate();
  const showAlert = useShowAlert();

  if (!userAuthenticated) {
    showAlert("You must be logged in to access this page", "warning");
    navigate("/sign-in");
  }

  return <Outlet />;
};

export default PrivateRoutes;
