import { Link } from "react-router-dom";

// components
import Title from "../../components/UI/Title";
import SubscribeLink from "../../components/SubscribeLink";

const Home = () => {
  return (
    <div className="home-container">
      <Title
        title="Welcome to Funance"
        subtitle="Explore and Learn About Investing Through Our Blog Posts and Interactive Simulators"
      />
      <p className="fs-5">
        With inflation on the rise, it's more important than ever to invest.
      </p>

      <p className="fs-5">
        Ready to test an investment strategy? Create or join a lobby in the{" "}
        <strong>Portfolio Simulator</strong> (now complete with options
        trading). Compete against others (or yourself) to see who can achieve
        the highest returns using real-time stock data! Start by checking out
        the{" "}
        <Link to="/game-rules" className="text-white">
          Game Rules
        </Link>{" "}
        and explore ongoing games in the{" "}
        <Link to="/games" className="text-white">
          Game List
        </Link>
        .
      </p>

      <p className="fs-5">
        Curious about the quantitative side of investing? Join me on my journey
        through{" "}
        <Link to="/blog" className="text-white">
          Funance Blog
        </Link>
        . Each week (for the most part), I explore new topics in quantitative
        finance, sharing any findings and insights along the way.
      </p>

      <p className="fs-5">
        Don't miss out! <SubscribeLink /> to Funance Blog for FREE and receive
        updates on the latest posts!
      </p>

      <p className="fs-5">
        Want to learn more about the project? Check out the{" "}
        <Link to="/about" className="text-white">
          About
        </Link>{" "}
        page.
      </p>
    </div>
  );
};

export default Home;
