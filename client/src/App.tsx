import { Routes, Route } from "react-router-dom";

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
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  // app version
  const version = "v1.3.1";

  return (
    <AuthProvider>
      <AlertProvider>
        <TopNavbar />

        <main className="container flex-shrink-0 content content-container my-4 w-100">
          <Routes>
            <Route path="*" element={<NotFound />} />
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />

            {/* funance blog */}
            <Route path="/blog">
              <Route index element={<Blog />} />
              <Route path=":blogId/:blogTitle" element={<BlogPost />} />
            </Route>

            {/* auth */}
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />

            {/* portfolio simulation */}
            <Route path="/game-rules" element={<GameRules />} />

            <Route path="/games">
              <Route index element={<GameList />} />
              <Route element={<PrivateRoutes />}>
                <Route path="create-game" element={<CreateGame />} />
              </Route>
              <Route path=":id" element={<GameLeaderboard />} />
            </Route>

            {/* private routes */}
            <Route element={<PrivateRoutes />}>
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

        <AlertNotification />

        <Footer version={version} />
      </AlertProvider>
    </AuthProvider>
  );
}

export default App;
