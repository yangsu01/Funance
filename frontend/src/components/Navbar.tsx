interface Props {
  activePage: string;
}

const Navbar = ({ activePage }: Props) => {
  return (
    <header className="m-3">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <a
            href="/"
            className="mb-3 me-2 mb-md-0 text-body-secondary text-decoration-none lh-1"
          >
            <img
              src="public/funance_logo.jpg"
              alt="FUNance logo"
              width="24"
              height="24"
            />
          </a>
          <button
            className="navbar-toggler collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
            aria-controls="navbarCollapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="navbar-collapse collapse" id="navbarCollapse">
            <ul className="navbar-nav me-auto mb-2 mb-md-0">
              <li className="nav-item">
                <a
                  className={`nav-link ${activePage === "/" && "text-white"}`}
                  href="/"
                >
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${
                    activePage === "/blog" && "text-white"
                  }`}
                  href="/blog"
                >
                  Blog
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${
                    activePage === "/game-rules" && "text-white"
                  }`}
                  href="/game-rules"
                >
                  Game Rules
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${
                    activePage === "/leaderboard" && "text-white"
                  }`}
                  href="/leaderboard"
                >
                  Leaderboard
                </a>
              </li>
              {/* <li className="nav-item">
                <a
                  className={`nav-link ${activePage === "/dashboard" && "text-white"}`}
                  href="/dashboard"
                >
                  My Portfolio
                </a>
              </li> */}
            </ul>
            <div className="d-flex">
              {/* <a className="btn btn-warning" id="signOut" href="{{ url_for('auth.sign_out') }}">Sign Out</a> */}
              <a
                className="btn btn-outline-light me-2"
                id="signIn"
                href="/sign-in"
              >
                Sign In
              </a>
              <a className="btn btn-warning" id="signUp" href="sign-up">
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
