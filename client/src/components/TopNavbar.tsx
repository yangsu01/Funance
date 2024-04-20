import { NavLink, useNavigate } from "react-router-dom";

// bootstrap elements
import { Button, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";

// utils
import api from "../utils/api";

interface Props {
  userAuthenticated: boolean;
  removeToken: () => void;
  setUserAuthenticated: (authenticated: boolean) => void;
}

const TopNavbar = ({
  userAuthenticated,
  removeToken,
  setUserAuthenticated,
}: Props) => {
  const navigate = useNavigate();

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
    <Navbar data-bs-theme="dark" bg="dark" expand="lg md" className="m-3">
      <Container fluid>
        <NavLink to="/" className="me-3">
          <img
            src="funance_logo.jpg"
            alt="FUNance logo"
            width="36"
            height="36"
          />
        </NavLink>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <NavLink to="/" className="nav-link">
              Home
            </NavLink>

            <NavLink to="/about" className="nav-link">
              About
            </NavLink>

            <NavLink to="/blog" className="nav-link">
              Blog
            </NavLink>

            {/* portfolio sim dropdown */}
            <NavDropdown title="Portfolio Simulator" id="portfolio-simulator">
              <NavLink to="/game-rules" className="nav-link ps-3">
                Game Rules
              </NavLink>
              {userAuthenticated && (
                <>
                  <NavDropdown.Divider />
                  <NavLink to="/games-list" className="nav-link ps-3">
                    Games List
                  </NavLink>
                  <NavLink to="/my-portfolio" className="nav-link ps-3">
                    My Portfolio
                  </NavLink>
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
                >
                  Sign In
                </NavLink>
                <NavLink
                  to="/sign-up"
                  className="btn btn-outline-light me-2 mb-2"
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
