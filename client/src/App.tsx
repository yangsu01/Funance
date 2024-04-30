import { Routes, Route } from "react-router-dom";
import { useState } from "react";

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
import Buy from "./pages/Buy/Buy";
import Sell from "./pages/Sell/Sell";
// auth
import SignIn from "./pages/SignIn/SignIn";
import SignUp from "./pages/SignUp/SignUp";
// funance blog
import BlogPost from "./pages/BlogPost/BlogPost";
import Blog from "./pages/Blog/Blog";

// UI components
import PrivateRoutes from "./components/PrivateRoutes";
import AlertNotification from "./components/AlertNotification";
import TopNavbar from "./components/TopNavbar";
import Footer from "./components/Footer";

// context
import { AlertProvider } from "./contexts/AlertContext";

function App() {
  // app version
  const version = "v1.0.0";

  // access tokens
  const { token, setToken, removeToken } = useToken();
  const [userAuthenticated, setUserAuthenticated] = useState(
    token ? true : false
  );

  // authenticate user
  const authenticateUser = (token: string) => {
    setToken(token);
    setUserAuthenticated(true);
  };

  return (
    <AlertProvider>
      {/* navbar */}
      <TopNavbar
        userAuthenticated={userAuthenticated}
        removeToken={removeToken}
        setUserAuthenticated={setUserAuthenticated}
      />

      {/* alert notification */}
      <AlertNotification />

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
            element={<SignIn authenticateUser={authenticateUser} />}
          />
          <Route
            path="/sign-up"
            element={<SignUp authenticateUser={authenticateUser} />}
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
              <Route index element={<GameList />} />
              <Route path="create-game" element={<CreateGame />} />
              <Route path=":id" element={<GameLeaderboard />} />
            </Route>
            <Route path="/portfolio">
              <Route index element={<Portfolio />} />
              <Route path=":id">
                <Route index element={<Portfolio />} />
                <Route path="buy" element={<Buy />} />
                <Route path="sell" element={<Sell />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </main>

      {/* footer */}
      <Footer version={version} />
    </AlertProvider>
  );
}

export default App;
