import React, { useState, createContext, useContext } from "react";

type Props = {
  children: React.ReactNode;
};

const AuthContext = createContext({
  userAuthenticated: false,
  token: null as string | null,
});
const AuthSaveContext = createContext<(token: string) => void>(() => {});
const AuthRemoveContext = createContext(() => {});

export function useAuth() {
  return useContext(AuthContext);
}

export function useSaveAuth() {
  return useContext(AuthSaveContext);
}

export function useRemoveAuth() {
  return useContext(AuthRemoveContext);
}

export function AuthProvider({ children }: Props) {
  const getToken = () => {
    const accessToken = localStorage.getItem("token");
    return accessToken ? accessToken : null;
  };

  const [userAuthenticated, setUserAuthenticated] = useState(false);
  const [token, setToken] = useState(getToken());

  const saveToken = (accessToken: string) => {
    localStorage.setItem("token", accessToken);
    setToken(accessToken);
    setUserAuthenticated(true);
  };

  const removeToken = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUserAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ userAuthenticated, token }}>
      <AuthSaveContext.Provider value={saveToken}>
        <AuthRemoveContext.Provider value={removeToken}>
          {children}
        </AuthRemoveContext.Provider>
      </AuthSaveContext.Provider>
    </AuthContext.Provider>
  );
}
