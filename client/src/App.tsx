import { Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";

// utilities
import useToken from "./utils/useToken";

// Pages
import Home from "./pages/Home";
import GameRules from "./pages/GameRules";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

// UI components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  // app version
  const version = "v1.0.0";

  // access tokens
  const { token, setToken, removeToken } = useToken();

  //states
  const [userAuthenticated, setUserAuthenticated] = useState(
    token ? true : false
  );

  // routes
  const routes = [
    { path: "/", component: <Home /> },
    { path: "/game-rules", component: <GameRules /> },
    { path: "*", component: <NotFound /> },
    {
      path: "/sign-up",
      component: (
        <SignUp
          setToken={setToken}
          setUserAuthenticated={setUserAuthenticated}
        />
      ),
    },
    {
      path: "/sign-in",
      component: (
        <SignIn
          setToken={setToken}
          setUserAuthenticated={setUserAuthenticated}
        />
      ),
    },
  ];

  const activePage = useLocation().pathname;

  return (
    <>
      <Navbar
        activePage={activePage}
        userAuthenticated={userAuthenticated}
        removeToken={removeToken}
      />

      <main className="container flex-shrink-0 content content-container my-3 w-100">
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.component}
            />
          ))}
        </Routes>
      </main>

      <Footer version={version} />
    </>
  );
}

export default App;
