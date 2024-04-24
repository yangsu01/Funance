import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// bootstrap elements
import { Alert } from "react-bootstrap";

// utilities
import useToken from "./utils/useToken";

// Pages
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import About from "./pages/About";
import BlogList from "./pages/BlogList";
import GameRules from "./pages/GameRules";
import GameList from "./pages/GameList";
import CreateGame from "./pages/CreateGame";
import MyPortfolio from "./pages/MyPortfolio";
import GameLeaderboard from "./pages/GameLeaderboard";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

// UI components
import PrivateRoutes from "./components/PrivateRoutes";
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

  const { state } = useLocation();
  const navigate = useNavigate();

  const showAlert = (
    message: string,
    type: "success" | "danger" | "warning"
  ) => {
    setAlertType(type);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  // auto close alert after 5 seconds
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  useEffect(() => {
    if (state) {
      showAlert(state.alert, state.alertType);
      navigate(location.pathname, { replace: true });
    }
  }, [state]);

  return (
    <>
      {/* navbar */}
      <TopNavbar
        userAuthenticated={userAuthenticated}
        removeToken={removeToken}
        setUserAuthenticated={setUserAuthenticated}
      />

      <main className="container flex-shrink-0 content content-container my-4 w-100">
        {/* routes */}
        <Routes>
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<BlogList />} />
          <Route
            path="/game-rules"
            element={<GameRules userAuthenticated={userAuthenticated} />}
          />
          <Route
            path="/sign-in"
            element={
              <SignIn
                setToken={setToken}
                setUserAuthenticated={setUserAuthenticated}
                showAlert={showAlert}
              />
            }
          />
          <Route
            path="/sign-up"
            element={
              <SignUp
                setToken={setToken}
                setUserAuthenticated={setUserAuthenticated}
                showAlert={showAlert}
              />
            }
          />

          {/* private routes (require authentication) */}
          <Route
            element={<PrivateRoutes userAuthenticated={userAuthenticated} />}
          >
            <Route path="/games">
              <Route
                index
                element={<GameList token={token} showAlert={showAlert} />}
              />
              <Route
                path="create-game"
                element={<CreateGame token={token} showAlert={showAlert} />}
              />
              <Route path="leaderboard">
                <Route path=":id" element={<GameLeaderboard token={token} />} />
              </Route>
            </Route>
            <Route path="/my-portfolio" element={<MyPortfolio />} />
          </Route>
        </Routes>
      </main>

      {/* footer */}
      <Footer version={version} />

      {/* alert flashing */}
      {alertVisible && (
        <Alert
          variant={alertType}
          onClose={() => setAlertVisible(false)}
          dismissible
        >
          {alertMessage}
        </Alert>
      )}
    </>
  );
}

export default App;
