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
  const [userAuthenticated, setUserAuthenticated] = useState(
    token ? true : false
  );
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState<AlertMessage>(
    {} as AlertMessage
  );
  const { state } = useLocation();
  const navigate = useNavigate();

  // authenticate user
  const authenticateUser = (token: string) => {
    setToken(token);
    setUserAuthenticated(true);
  };

  // alert flashing
  const showAlert = (alertMessage: AlertMessage) => {
    setAlertMessage(alertMessage);
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
  // flash alert on page change if state is updated
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
          <Route path="/blog">
            <Route index element={<Blog />} />
            <Route path=":id" element={<BlogPost />} />
          </Route>

          {/* auth */}
          <Route
            path="/sign-in"
            element={
              <SignIn
                authenticateUser={authenticateUser}
                showAlert={showAlert}
              />
            }
          />
          <Route
            path="/sign-up"
            element={
              <SignUp
                authenticateUser={authenticateUser}
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
              <Route index element={<GameList showAlert={showAlert} />} />
              <Route
                path="create-game"
                element={<CreateGame showAlert={showAlert} />}
              />
              <Route
                path=":id"
                element={<GameLeaderboard showAlert={showAlert} />}
              />
            </Route>
            <Route path="/portfolio">
              <Route index element={<Portfolio showAlert={showAlert} />} />
              <Route path=":id" element={<Portfolio showAlert={showAlert} />} />
            </Route>
          </Route>
        </Routes>
      </main>

      {/* footer */}
      <Footer version={version} />

      {/* alert flashing */}
      {alertVisible && (
        <Alert
          variant={alertMessage.alertType}
          onClose={() => setAlertVisible(false)}
          dismissible
        >
          {alertMessage.alert}
        </Alert>
      )}
    </>
  );
}

export default App;
