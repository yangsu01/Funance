import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import { NavLink, useNavigate } from "react-router-dom";

// bootstrap elements
import { Button, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";

// utils
import api from "../utils/api";

type Props = {
  userAuthenticated: boolean;
  removeToken: () => void;
  setUserAuthenticated: (authenticated: boolean) => void;
};

const TopNavbar = (props: Props) => {
  const { userAuthenticated, removeToken, setUserAuthenticated } = props;

  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const isSmallScreen = useMediaQuery({ maxWidth: 767 });

  const handleToggle = () => {
    if (isSmallScreen) {
      setExpanded(!expanded);
    }
  };

  const signOutUser = async () => {
    // call backend api
    try {
      await api.post("/signout-user");

      removeToken();
      setUserAuthenticated(false);

      navigate(0);
    } catch (error: any) {
      console.log(error);
    }
  };

  return (
    <Navbar
      sticky="top"
      expand="md"
      expanded={expanded}
      className="mt-3 bg-dark"
    >
      <Container>
        <Navbar.Brand href="/" className="mb-3">
          <img
            src="funance_logo.jpg"
            alt="FUNance logo"
            width="36"
            height="36"
          />
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="responsive-navbar-nav"
          onClick={handleToggle}
          className="mb-3"
        />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto mb-3">
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
                    to="/game-list"
                    className="nav-link ps-3"
                    onClick={handleToggle}
                  >
                    Game List
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    as={NavLink}
                    to="/my-portfolio"
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
              <Button variant="outline-light mb-2" onClick={signOutUser}>
                Sign Out
              </Button>
            ) : (
              <>
                <NavLink
                  to="/sign-in"
                  className="btn btn-outline-light me-2 mb-2"
                  onClick={handleToggle}
                >
                  Sign In
                </NavLink>
                <NavLink
                  to="/sign-up"
                  className="btn btn-outline-light me-2 mb-2"
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
