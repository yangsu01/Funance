import { Link } from "react-router-dom";

// components
import Title from "../../components/UI/Title";

const Home = () => {
  return (
    <div className="home-container">
      <Title
        title="Welcome to Funance"
        subtitle="Explore and Learn About Quantitative Finance Through Blog Posts and Simulators"
      />
      <p className="fs-5">
        With inflation on the rise, investing has become more important than
        ever.
      </p>

      <p className="fs-5">
        <p className="fs-5">
          Curious about the quantitative side of finance and investing? Join me
          on my journey through{" "}
          <Link to="/blog" className="text-white">
            Funance Blog
          </Link>{" "}
          where each post dives into a different topic, sharing my learnings and
          showcasing real-world applications with data visualizations.
        </p>
        Ready to test a trading strategy? Try the{" "}
        <strong>Portfolio Simulator</strong>! Create or join a lobby, compete
        against others (or yourself), and see who can achieve the highest
        returns with real-time stock data! Start by checking out the{" "}
        <Link to="/game-rules" className="text-white">
          Game Rules
        </Link>{" "}
        and ongoing games in the{" "}
        <Link to="/games" className="text-white">
          Game List
        </Link>
        .
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
