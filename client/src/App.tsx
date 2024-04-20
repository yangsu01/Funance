import { Routes, Route } from "react-router-dom";
import { useState } from "react";

// bootstrap elements
import { Alert } from "react-bootstrap";

// utilities
import useToken from "./utils/useToken";

// Pages
import Home from "./pages/Home";
import GameRules from "./pages/GameRules";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

// UI components
import TopNavbar from "./components/TopNavbar";
import Footer from "./components/Footer";

function App() {
  // app version
  const version = "v1.0.0";

  // access tokens
  const { token, setToken, removeToken } = useToken();

  // user authentication
  const [userAuthenticated, setUserAuthenticated] = useState(
    token ? true : false
  );

  // alert flashing
  let [alertVisible, setAlertVisible] = useState(false);
  let [alertMessage, setAlertMessage] = useState("");
  let [alertType, setAlertType] = useState("success");

  const showAlert = (
    message: string,
    type: "success" | "danger" | "warning"
  ) => {
    setAlertType(type);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  // routes
  const routes = [
    { path: "/", component: <Home /> },
    {
      path: "/game-rules",
      component: <GameRules userAuthenticated={userAuthenticated} />,
    },
    { path: "*", component: <NotFound /> },
    {
      path: "/sign-up",
      component: (
        <SignUp
          setToken={setToken}
          setUserAuthenticated={setUserAuthenticated}
          showAlert={showAlert}
        />
      ),
    },
    {
      path: "/sign-in",
      component: (
        <SignIn
          setToken={setToken}
          setUserAuthenticated={setUserAuthenticated}
          showAlert={showAlert}
        />
      ),
    },
  ];

  return (
    <>
      <TopNavbar
        userAuthenticated={userAuthenticated}
        removeToken={removeToken}
        setUserAuthenticated={setUserAuthenticated}
      />

      <main className="container flex-shrink-0 content content-container my-4 w-100">
        {alertVisible && (
          <Alert
            variant={alertType}
            onClose={() => setAlertVisible(false)}
            dismissible
            className=""
          >
            {alertMessage}
          </Alert>
        )}
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
