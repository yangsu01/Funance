import { Navigate, Outlet } from "react-router-dom";

type Props = {
  userAuthenticated: boolean;
};

const PrivateRoutes = (props: Props) => {
  const { userAuthenticated } = props;

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
