import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// bootstrap elements
import { Alert } from "react-bootstrap";

// utilities
import useToken from "./hooks/useToken";

// general
import NotFound from "./pages/NotFound/NotFound";
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
// portfolio simulation
import GameRules from "./pages/GameRules/GameRules";
import GameList from "./pages/GameList/GameList";
import CreateGame from "./pages/CreateGame/CreateGame";
import Portfolio from "./pages/Portfolio/Portfolio";
import GameLeaderboard from "./pages/GameLeaderboard/GameLeaderboard";
// auth
import SignIn from "./pages/SignIn/SignIn";
import SignUp from "./pages/SignUp/SignUp";
// funance blog
import BlogPost from "./pages/BlogPost/BlogPost";
import Blog from "./pages/Blog/Blog";

// UI components
import PrivateRoutes from "./components/PrivateRoutes";
import TopNavbar from "./components/TopNavbar";
import Footer from "./components/Footer";

//custom types
import { AlertMessage } from "./utils/types";

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

  const showAlert = (alertMessage: AlertMessage) => {
    setAlertType(alertMessage.alertType);
    setAlertMessage(alertMessage.alert);
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
      showAlert(state as AlertMessage);
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

          {/* funance blog */}
          <Route path="/blog" element={<Blog />}>
            <Route
              index
              element={<GameList token={token} showAlert={showAlert} />}
            />
            <Route path=":id" element={<BlogPost />} />
          </Route>

          {/* auth */}
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

          {/* portfolio simulation */}
          <Route
            path="/game-rules"
            element={<GameRules userAuthenticated={userAuthenticated} />}
          />
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
              <Route
                path=":id"
                element={
                  <GameLeaderboard token={token} showAlert={showAlert} />
                }
              />
            </Route>
            <Route path="/my-portfolio" element={<Portfolio />} />
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
