import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import { NavLink, useNavigate } from "react-router-dom";
import { Button, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";

//hooks
import usePost from "../hooks/usePost";
// contexts
import { useAuth, useRemoveAuth } from "../contexts/AuthContext";

const TopNavbar = () => {
  const [expanded, setExpanded] = useState(false);

  const isSmallScreen = useMediaQuery({ maxWidth: 767 });
  const navigate = useNavigate();
  const { postData } = usePost();
  const { userAuthenticated } = useAuth();
  const removeToken = useRemoveAuth();

  const handleToggle = () => {
    if (isSmallScreen) {
      setExpanded(!expanded);
    }
  };

  const handleSignOut = async () => {
    const post = async () => {
      return await postData("/signout-user", {});
    };

    post().then((res) => {
      if (res.status === "success") {
        removeToken();
        navigate(0);
      }
    });
  };

  return (
    <Navbar
      sticky="top"
      expand="md"
      expanded={expanded}
      className="mt-3 bg-dark mx-3"
    >
      <Container>
        <Navbar.Brand href="/" className="d-flex align-items-center">
          <img
            src="/funance_logo.png"
            alt="logo"
            width="30"
            height="30"
            className="me-2"
          />
          <strong>FUNance</strong>
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="responsive-navbar-nav"
          onClick={handleToggle}
        />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto pt-1">
            <Nav.Link as={NavLink} to="/" onClick={handleToggle}>
              Home
            </Nav.Link>

            <Nav.Link as={NavLink} to="/about" onClick={handleToggle}>
              About
            </Nav.Link>

            <Nav.Link as={NavLink} to="/blog" onClick={handleToggle}>
              Blog
            </Nav.Link>
            <NavDropdown title="Portfolio Simulator" id="portfolio-simulator">
              <NavDropdown.Item
                as={NavLink}
                to="/game-rules"
                className="nav-link ps-3"
                onClick={handleToggle}
              >
                Game Rules
              </NavDropdown.Item>
              {userAuthenticated && (
                <>
                  <NavDropdown.Divider />
                  <NavDropdown.Item
                    as={NavLink}
                    to="/games"
                    className="nav-link ps-3"
                    onClick={handleToggle}
                  >
                    Game List
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    as={NavLink}
                    to="/games/create-game"
                    className="nav-link ps-3"
                    onClick={handleToggle}
                  >
                    Create Game
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    as={NavLink}
                    to="/portfolio"
                    className="nav-link ps-3"
                    onClick={handleToggle}
                  >
                    My Portfolio
                  </NavDropdown.Item>
                </>
              )}
            </NavDropdown>
          </Nav>
          <Nav>
            {userAuthenticated ? (
              <Button
                variant="outline-light"
                onClick={handleSignOut}
                className={`me-2 ${isSmallScreen ? "mt-2 mb-2" : ""}`}
              >
                Sign Out
              </Button>
            ) : (
              <>
                <NavLink
                  to="/sign-in"
                  className={`btn btn-outline-light me-2 ${
                    isSmallScreen ? "mt-2 mb-2" : ""
                  }`}
                  onClick={handleToggle}
                >
                  Sign In
                </NavLink>
                <NavLink
                  to="/sign-up"
                  className={`btn btn-outline-light me-2 ${
                    isSmallScreen ? "mt-2 mb-2" : ""
                  }`}
                  onClick={handleToggle}
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default TopNavbar;
