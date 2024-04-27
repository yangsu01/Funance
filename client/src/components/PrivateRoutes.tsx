import React from "react";
import { Navigate, Outlet } from "react-router-dom";

type Props = {
  userAuthenticated: boolean;
};

const PrivateRoutes: React.FC<Props> = ({ userAuthenticated }) => {
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
