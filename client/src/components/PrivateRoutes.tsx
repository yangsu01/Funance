import { Navigate, Outlet } from "react-router-dom";

interface Props {
  userAuthenticated: boolean;
}

const PrivateRoutes = ({ userAuthenticated }: Props) => {
  return userAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate
      to="/sign-in"
      state={{
        alert: "Please sign in to view this page",
        alertType: "warning",
      }}
    />
  );
};

export default PrivateRoutes;
