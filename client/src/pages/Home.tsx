import { Link } from "react-router-dom";

// components
import Title from "../components/Title";

const Home = () => {
  const title = "Welcome to Funance";
  const subtitle = "Investing is fun!";

  return (
    <div className="home-container">
      <Title title={title} subtitle={subtitle} />

      <p className="fs-5">
        Join me on my journey of learning about everything finance, especially
        the quantitative side of it! Be sure to Check out my latest{" "}
        <strong>Weekly blog</strong> posts uploaded on{" "}
        <Link to="/blog" className="text-white">
          Funance Blog
        </Link>{" "}
        where I explore and learn about different applications of math and
        datascience in finance and investing.
      </p>

      <p className="fs-5">
        Want to test the waters or try out a new investing strategy? Create/join
        a lobby and start trading in the <strong>Portfolio Simulator</strong>:
        Compete against others (or yourself) to see who can make the most money
        in a set amount of time! All prices are based on real-time stock data.
        check out the{" "}
        <Link to="/game-rules" className="text-white">
          Game Rules
        </Link>{" "}
        to get started. Want to see all the game lobbies available? Head over to
        the{" "}
        <Link to="/game-list" className="text-white">
          Game List
        </Link>{" "}
        for the full list of games (you will need to be signed in to view this
        page).
      </p>
    </div>
  );
};

export default Home;
